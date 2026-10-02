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

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: {
        order
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
    const { reason = 'Customer requested return' } = req.body;

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

    order.status = 'Returned';
    order.returnReason = reason;
    order.statusTimeline.push({
      status: 'Returned',
      comment: `Return initiated by customer. Reason: ${reason}`,
      timestamp: new Date()
    });

    await order.save();
    await restoreInventory(order.items);

    res.status(200).json({
      success: true,
      message: 'Return request submitted successfully',
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

module.exports = {
  getMyOrders,
  getOrderById,
  cancelOrder,
  returnOrder,
  getSellerOrders,
  updateSellerOrderStatus,
  getAllOrders,
  getInvoice
};
