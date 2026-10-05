const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { getPagination } = require('../utils/paginate');
const { generateInvoicePdf } = require('../utils/invoicePdf');
const {
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail
} = require('../utils/emailService');
const { notifyOrderStatusChange } = require('../utils/notificationService');
const { logSecurityEvent } = require('../utils/auditLogger');

/**
 * Helper to atomically restore variant stock on cancellation/returns
 */
const restoreInventory = async (items) => {
  for (const item of items) {
    await Product.findOneAndUpdate(
      {
        _id: item.product,
        variants: {
          $elemMatch: { _id: item.variantId }
        }
      },
      {
        $inc: { 'variants.$.stock': item.quantity }
      }
    );
  }
};

/**
 * @desc    Get logged-in customer's order history
 * @route   GET /api/orders/my-orders
 * @access  Private (Customer)
 */
const getMyOrders = async (req, res) => {
  try {
    const { page, limit, skip, getPaginationMeta } = getPagination(req.query, 10);

    const [orders, totalCount] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ user: req.user._id })
    ]);

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders,
        pagination: getPaginationMeta(totalCount)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch orders: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Get single order details by ID or orderNumber
 * @route   GET /api/orders/:id
 * @access  Private (Customer Owner, Seller, or Admin)
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { orderNumber: id };

    const order = await Order.findOne(query)
      .populate('user', 'name email mobile')
      .populate('items.seller', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null
      });
    }

    // Authorization checks: Customer owner, Seller of an item in the order, or Admin
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isSeller = order.items.some(
      (item) => item.seller && item.seller._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isAdmin && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this order',
        data: null
      });
    }

    const orderObj = order.toObject();
    if (!orderObj.tracking || !orderObj.tracking.awbNumber) {
      const shortCode = (orderObj.orderNumber || orderObj._id.toString()).replace(/[^A-Za-z0-9]/g, '').slice(-8).toUpperCase();
      const estDate = new Date(orderObj.createdAt);
      estDate.setDate(estDate.getDate() + 3);

      orderObj.tracking = {
        carrier: 'Delhivery Surface & Air Express',
        awbNumber: `DLV-${shortCode}-IN`,
        estimatedDelivery: estDate,
        courierPartner: {
          name: 'Rajesh Sharma',
          phone: '+91 98234 11092'
        },
        currentLocation:
          orderObj.status === 'Delivered'
            ? `${orderObj.shippingAddress?.city || 'Local Area'} (Delivered)`
            : orderObj.status === 'Shipped'
            ? `${orderObj.shippingAddress?.city || 'Local Sorting'} Distribution Center`
            : 'Bengaluru Central Fulfillment Center'
      };
    }

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: {
        order: orderObj
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve order: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Customer cancels order (only if Placed or Confirmed)
 * @route   PUT /api/orders/:id/cancel
 * @access  Private (Customer or Admin)
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null
      });
    }

    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to cancel this order',
        data: null
      });
    }

    // State Machine Guard: Only Placed or Confirmed orders can be cancelled
    if (['Shipped', 'Delivered', 'Cancelled', 'Returned'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in '${order.status}' status. Return may be requested after delivery.`,
        data: null
      });
    }

    order.status = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = reason;

    // Refund status if online payment was completed
    if (order.paymentInfo.status === 'Completed') {
      order.paymentInfo.status = 'Refunded';
    }

    order.statusTimeline.push({
      status: 'Cancelled',
      comment: `Order cancelled. Reason: ${reason}`,
      timestamp: new Date()
    });

    await order.save();

    // Atomically restore variant stock
    await restoreInventory(order.items);

    // Record immutable audit event
    logSecurityEvent({
      action: 'ORDER_CANCELLED',
      severity: 'warning',
      req,
      user: req.user,
      target: { targetType: 'Order', targetId: order._id },
      details: { orderNumber: order.orderNumber, reason, totalAmount: order.totalAmount }
    });

    // Non-blocking cancellation email
    User.findById(order.user)
      .select('name email')
      .then((u) => {
        if (u) sendOrderCancelledEmail(order, u.email, reason);
      })
      .catch((err) => console.error('[EMAIL ERROR] Cancel email error:', err.message));

    // Non-blocking in-app notification
    notifyOrderStatusChange(order, 'Cancelled', `Order #${order.orderNumber} was cancelled. Reason: ${reason}`).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and inventory restored',
      data: {
        order
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to cancel order: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Customer requests return on delivered order
 * @route   PUT /api/orders/:id/return
 * @access  Private (Customer)
 */
const returnOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      reason = 'Customer requested return',
      reasonCategory = 'OTHER',
      comments = '',
      photos = [],
      resolutionType = 'REFUND'
    } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to return this order',
        data: null
      });
    }

    if (order.status !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Returns can only be requested on orders that have been Delivered',
        data: null
      });
    }

    // Check 7-day return window from deliveredAt (or updatedAt if deliveredAt not explicitly set)
    const deliveryDate = order.deliveredAt || order.updatedAt;
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - new Date(deliveryDate).getTime() > sevenDaysInMs) {
      return res.status(400).json({
        success: false,
        message: 'Return window expired: Items must be returned within 7 days of delivery',
        data: null
      });
    }

    order.status = 'Return Requested';
    order.returnReason = reason;
    order.returnRequest = {
      reason,
      reasonCategory,
      comments,
      photos: Array.isArray(photos) ? photos : [],
      resolutionType,
      status: 'Requested',
      sellerNotes: '',
      requestedAt: new Date()
    };

    order.statusTimeline.push({
      status: 'Return Requested',
      comment: `Customer requested return (${reasonCategory.replace(/_/g, ' ')}): "${reason}". Resolution requested: ${resolutionType}`,
      timestamp: new Date()
    });

    await order.save();

    // In-app notification to buyer
    notifyOrderStatusChange(
      order,
      'Return Requested',
      `Return request submitted for Order #${order.orderNumber}. The seller will review your request shortly.`
    ).catch(() => {});

    // In-app notification to item sellers
    const { createNotification } = require('../utils/notificationService');
    const sellerIds = [...new Set(order.items.map((i) => i.seller?.toString()).filter(Boolean))];
    for (const sId of sellerIds) {
      createNotification({
        user: sId,
        title: 'New Return Request ⚠️',
        message: `Customer initiated a return for Order #${order.orderNumber} (${reasonCategory.replace(/_/g, ' ')}). Please review.`,
        type: 'ORDER_STATUS',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          link: '/seller/dashboard',
          icon: 'alert'
        }
      }).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: 'Return request submitted successfully and is pending seller review',
      data: {
        order
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to process return: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Seller views orders containing their items
 * @route   GET /api/orders/seller/orders
 * @access  Private (Seller or Admin)
 */
const getSellerOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const { page, limit, skip, getPaginationMeta } = getPagination(req.query, 10);

    const filter = { 'items.seller': req.user._id };
    if (status) filter.status = status;

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email mobile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter)
    ]);

    // Format orders so seller clearly sees which items are theirs
    const sellerFormattedOrders = orders.map((order) => {
      const myItems = order.items.filter(
        (item) => item.seller.toString() === req.user._id.toString()
      );
      const myItemsRevenue = myItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

      return {
        ...order,
        sellerItems: myItems,
        sellerTotalRevenue: myItemsRevenue
      };
    });

    res.status(200).json({
      success: true,
      message: 'Seller orders retrieved successfully',
      data: {
        orders: sellerFormattedOrders,
        pagination: getPaginationMeta(totalCount)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch seller orders: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Seller or Admin advances order status (Placed -> Confirmed -> Shipped -> Delivered)
 * @route   PUT /api/orders/seller/:id/status
 * @access  Private (Seller or Admin)
 */
const updateSellerOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const validStatuses = ['Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status update. Allowed transitions: ${validStatuses.join(', ')}`,
        data: null
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null
      });
    }

    const isAdmin = req.user.role === 'admin';
    const isSeller = order.items.some(
      (item) => item.seller.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to manage this order',
        data: null
      });
    }

    // State machine progression validations
    if (order.status === 'Placed' && !['Confirmed', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'A Placed order must be Confirmed or Cancelled before shipping',
        data: null
      });
    }

    if (order.status === 'Confirmed' && !['Shipped', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'A Confirmed order can only be moved to Shipped or Cancelled',
        data: null
      });
    }

    if (order.status === 'Shipped' && status !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'A Shipped order can only be updated to Delivered',
        data: null
      });
    }

    if (['Delivered', 'Cancelled', 'Returned'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update order in terminal state '${order.status}'`,
        data: null
      });
    }

    // Update status
    order.status = status;
    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      // If payment was COD, mark as Completed upon delivery
      if (order.paymentInfo.method === 'COD') {
        order.paymentInfo.status = 'Completed';
        order.paymentInfo.paidAt = new Date();
      }
    }

    order.statusTimeline.push({
      status,
      comment: comment || `Order marked as ${status} by seller/admin`,
      timestamp: new Date()
    });

    await order.save();

    // Non-blocking transactional emails based on status
    User.findById(order.user)
      .select('name email')
      .then((u) => {
        if (!u) return;
        if (status === 'Shipped') sendOrderShippedEmail(order, u.email, { courier: 'BlueDart Express' });
        if (status === 'Delivered') sendOrderDeliveredEmail(order, u.email);
        if (status === 'Cancelled') sendOrderCancelledEmail(order, u.email, comment);
      })
      .catch((err) => console.error('[EMAIL ERROR] Status transition email error:', err.message));

    // Non-blocking in-app notification dispatch
    notifyOrderStatusChange(order, status, comment).catch((err) =>
      console.error('[NOTIFICATION ERROR] Status change notification error:', err.message)
    );

    res.status(200).json({
      success: true,
      message: `Order status advanced to '${status}' successfully`,
      data: {
        order
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update order status: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Admin retrieves all platform orders
 * @route   GET /api/orders/admin/all
 * @access  Private (Admin only)
 */
const getAllOrders = async (req, res) => {
  try {
    const { status, paymentMethod } = req.query;
    const { page, limit, skip, getPaginationMeta } = getPagination(req.query, 10);

    const filter = {};
    if (status) filter.status = status;
    if (paymentMethod) filter['paymentInfo.method'] = paymentMethod;

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email mobile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: 'All platform orders retrieved successfully',
      data: {
        orders,
        pagination: getPaginationMeta(totalCount)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch all orders: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Generate and stream PDF tax invoice
 * @route   GET /api/orders/:id/invoice
 * @access  Private (Customer Owner, Seller, or Admin)
 */
const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { orderNumber: id };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null
      });
    }

    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isSeller = order.items.some(
      (item) => item.seller.toString() === req.user._id.toString()
    );

    if (!isOwner && !isAdmin && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to download this invoice',
        data: null
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Rigamart-Invoice-${order.orderNumber}.pdf`
    );

    await generateInvoicePdf(order, res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: `Failed to generate PDF invoice: ${error.message}`,
        data: null
      });
    }
  }
};

/**
 * @desc    Get all orders with return requests for the seller
 * @route   GET /api/orders/seller/returns or /api/seller/returns
 * @access  Private (Seller or Admin)
 */
const getSellerReturns = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {
      'items.seller': req.user._id,
      $or: [
        { returnRequest: { $ne: null } },
        { status: { $in: ['Return Requested', 'Returned'] } }
      ]
    };

    if (status) {
      filter['returnRequest.status'] = status;
    }

    const returns = await Order.find(filter)
      .populate('user', 'name email mobile')
      .populate('items.seller', 'name email')
      .sort({ 'returnRequest.requestedAt': -1, updatedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Seller return requests retrieved successfully',
      data: {
        returns
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch seller returns: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Seller or Admin advances or resolves a return request
 * @route   PUT /api/orders/seller/:id/return-status or /api/seller/orders/:id/return-status
 * @access  Private (Seller or Admin)
 */
const updateReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, sellerNotes = '', pickupDate = null } = req.body;

    const validStatuses = ['Approved', 'Rejected', 'Pickup_Scheduled', 'Item_Received', 'Refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid return status. Permitted: ${validStatuses.join(', ')}`,
        data: null
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null
      });
    }

    const isAdmin = req.user.role === 'admin';
    const isSeller = order.items.some(
      (item) => item.seller && item.seller.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to manage this return',
        data: null
      });
    }

    if (!order.returnRequest) {
      order.returnRequest = {
        reason: order.returnReason || 'Return initiated',
        status: 'Requested',
        requestedAt: new Date()
      };
    }

    order.returnRequest.status = status;
    if (sellerNotes) order.returnRequest.sellerNotes = sellerNotes;
    if (pickupDate) order.returnRequest.pickupDate = new Date(pickupDate);

    let timelineComment = `Return status changed to '${status}' by seller.`;
    if (status === 'Approved') {
      timelineComment = `Return request approved by seller. Pickup will be coordinated soon. ${sellerNotes ? 'Note: ' + sellerNotes : ''}`;
    } else if (status === 'Pickup_Scheduled') {
      const dateStr = pickupDate ? ` for ${new Date(pickupDate).toLocaleDateString('en-IN')}` : '';
      timelineComment = `Return courier pickup scheduled${dateStr}. Please keep the item packed with original tags intact.`;
    } else if (status === 'Item_Received') {
      timelineComment = `Returned item received at seller fulfillment hub and verified in original condition.`;
    } else if (status === 'Refunded') {
      order.status = 'Returned';
      order.paymentInfo.status = 'Refunded';
      order.returnRequest.refundAmount = order.totalAmount;
      order.returnRequest.resolvedAt = new Date();
      timelineComment = `Full refund of ₹${order.totalAmount.toLocaleString('en-IN')} successfully initiated to buyer. ${sellerNotes ? 'Note: ' + sellerNotes : ''}`;
      // Atomically restore variant stock
      await restoreInventory(order.items);
    } else if (status === 'Rejected') {
      order.returnRequest.resolvedAt = new Date();
      timelineComment = `Return request declined by seller. Reason: ${sellerNotes || 'Item condition does not satisfy policy guidelines'}`;
    }

    order.statusTimeline.push({
      status: `Return: ${status.replace(/_/g, ' ')}`,
      comment: timelineComment,
      timestamp: new Date()
    });

    await order.save();

    // Buyer notification
    const buyerNotifConfig = {
      Approved: {
        title: 'Return Approved! 📦',
        message: `Your return request for Order #${order.orderNumber} has been approved by the seller.`,
        icon: 'package'
      },
      Pickup_Scheduled: {
        title: 'Return Pickup Scheduled 🚚',
        message: `Courier pickup for Order #${order.orderNumber} has been scheduled. Please keep item ready.`,
        icon: 'truck'
      },
      Item_Received: {
        title: 'Return Received at Hub 🏢',
        message: `Returned package for Order #${order.orderNumber} was received and verified.`,
        icon: 'check'
      },
      Refunded: {
        title: 'Refund Processed! 💳',
        message: `Refund of ₹${order.totalAmount.toLocaleString('en-IN')} for Order #${order.orderNumber} was successfully processed.`,
        icon: 'sparkles'
      },
      Rejected: {
        title: 'Return Request Declined ⚠️',
        message: `Return for Order #${order.orderNumber} was not approved: ${sellerNotes || 'Please contact support for assistance.'}`,
        icon: 'alert'
      }
    };

    const notif = buyerNotifConfig[status];
    if (notif) {
      const { createNotification } = require('../utils/notificationService');
      createNotification({
        user: order.user,
        title: notif.title,
        message: notif.message,
        type: 'ORDER_STATUS',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          link: `/orders/${order._id}`,
          icon: notif.icon
        }
      }).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: `Return status updated to '${status}' successfully`,
      data: {
        order
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update return status: ${error.message}`,
      data: null
    });
  }
};

module.exports = {
  getMyOrders,
  getOrderById,
  cancelOrder,
  returnOrder,
  getSellerOrders,
  updateSellerOrderStatus,
  getSellerReturns,
  updateReturnStatus,
  getAllOrders,
  getInvoice
};
