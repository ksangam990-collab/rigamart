const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature
} = require('../config/razorpay');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

/**
 * Helper to atomically decrement stock for order items using $elemMatch
 * to ensure the positional operator '$' targets the exact variant subdocument
 */
const decrementInventory = async (items) => {
  for (const item of items) {
    await Product.findOneAndUpdate(
      {
        _id: item.product,
        variants: {
          $elemMatch: {
            _id: item.variantId,
            stock: { $gte: item.quantity }
          }
        }
      },
      {
        $inc: { 'variants.$.stock': -item.quantity }
      }
    );
  }
};

/**
 * @desc    Initialize payment checkout order (Razorpay or COD)
 * @route   POST /api/payment/create-order
 * @access  Private (Customer)
 */
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Validate payment method
    if (!['RAZORPAY', 'COD'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Allowed methods: "RAZORPAY", "COD"',
        data: null
      });
    }

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.mobile ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: 'A complete shipping address is required for checkout',
        data: null
      });
    }

    // Retrieve user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name brand images category isActive variants seller'
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot place order: Your cart is empty',
        data: null
      });
    }

    // Validate inventory and prepare frozen snapshot items
    const orderItems = [];
    let itemsPrice = 0;

    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${product ? product.name : 'Unknown'}" is unavailable`,
          data: null
        });
      }

      const variant = product.variants.id(item.variantId);
      if (!variant) {
        return res.status(400).json({
          success: false,
          message: `Variant SKU "${item.sku}" is no longer available`,
          data: null
        });
      }

      if (variant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for "${product.name}" (${variant.size}). Only ${variant.stock} units left.`,
          data: null
        });
      }

      const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];

      orderItems.push({
        product: product._id,
        name: product.name,
        image: primaryImage ? primaryImage.url : '',
        variantId: variant._id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        price: variant.price,
        quantity: item.quantity,
        seller: product.seller
      });

      itemsPrice += variant.price * item.quantity;
    }

    const shippingPrice = itemsPrice >= 500 ? 0 : 40;
    const taxPrice = 0; // Inclusive GST
    const totalAmount = itemsPrice + shippingPrice + taxPrice;

    // Generate readable Rigamart Order Number
    const orderNumber = `RGM-${Date.now().toString().slice(-8)}-${crypto.randomInt(1000, 9999)}`;

    // Flow A: Razorpay Online Payment
    if (paymentMethod === 'RAZORPAY') {
      const rzpOrder = await createRazorpayOrder(totalAmount, orderNumber, {
        userId: req.user._id.toString(),
        orderNumber
      });

      // Save order in Pending payment state
      const order = await Order.create({
        orderNumber,
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentInfo: {
          method: 'RAZORPAY',
          status: 'Pending',
          razorpayOrderId: rzpOrder.id
        },
        status: 'Placed',
        statusTimeline: [
          {
            status: 'Placed',
            comment: 'Order placed, awaiting Razorpay payment completion.',
            timestamp: new Date()
          }
        ],
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalAmount
      });

      return res.status(200).json({
        success: true,
        message: 'Razorpay order created successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          razorpayOrderId: rzpOrder.id,
          amount: rzpOrder.amount, // in paise
          currency: rzpOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
          totalAmount
        }
      });
    }

    // Flow B: Cash on Delivery (COD)
    if (paymentMethod === 'COD') {
      const order = await Order.create({
        orderNumber,
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentInfo: {
          method: 'COD',
          status: 'Pending'
        },
        status: 'Placed',
        statusTimeline: [
          {
            status: 'Placed',
            comment: 'Order placed successfully via Cash on Delivery.',
            timestamp: new Date()
          }
        ],
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalAmount
      });

      // Decrement inventory atomically using $elemMatch
      await decrementInventory(orderItems);

      // Clear customer's persistent cart
      await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });

      // Non-blocking transactional email notification
      sendOrderConfirmationEmail(order, req.user.email).catch((err) =>
        console.error('[EMAIL ERROR] Failed to send COD order confirmation:', err.message)
      );

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully with Cash on Delivery',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentMethod: 'COD',
          totalAmount: order.totalAmount,
          status: order.status
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to initiate order checkout: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Verify Razorpay HMAC SHA-256 payment signature
 * @route   POST /api/payment/verify
 * @access  Private (Customer)
 */
const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay verification parameters',
        data: null
      });
    }

    // Cryptographic signature check
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    const query = orderId ? { _id: orderId } : { 'paymentInfo.razorpayOrderId': razorpay_order_id };
    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order reference not found',
        data: null
      });
    }

    if (!isValid) {
      order.paymentInfo.status = 'Failed';
      order.statusTimeline.push({
        status: 'Cancelled',
        comment: 'Payment signature verification failed. Untrusted payment attempt.',
        timestamp: new Date()
      });
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature detected',
        data: null
      });
    }

    // Signature verified! Complete the order
    order.paymentInfo.status = 'Completed';
    order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
    order.paymentInfo.razorpaySignature = razorpay_signature;
    order.paymentInfo.paidAt = new Date();
    order.status = 'Confirmed';
    order.statusTimeline.push({
      status: 'Confirmed',
      comment: `Payment received via Razorpay (Txn ID: ${razorpay_payment_id})`,
      timestamp: new Date()
    });

    await order.save();

    // Decrement inventory using $elemMatch
    await decrementInventory(order.items);

    // Clear cart
    await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [] } });

    // Non-blocking transactional email notification
    sendOrderConfirmationEmail(order, req.user.email).catch((err) =>
      console.error('[EMAIL ERROR] Failed to send Razorpay order confirmation:', err.message)
    );

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentInfo.status,
        paidAt: order.paymentInfo.paidAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Payment verification error: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Handle asynchronous Razorpay Webhook events
 * @route   POST /api/payment/webhook
 * @access  Public (Signature validated)
 */
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing x-razorpay-signature header'
      });
    }

    const isValid = verifyWebhookSignature(req.body, signature);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const razorpayOrderId = payload.payment?.entity?.order_id || payload.order?.entity?.id;
      const paymentId = payload.payment?.entity?.id;

      if (razorpayOrderId) {
        const order = await Order.findOne({ 'paymentInfo.razorpayOrderId': razorpayOrderId });

        if (order && order.paymentInfo.status !== 'Completed') {
          order.paymentInfo.status = 'Completed';
          order.paymentInfo.razorpayPaymentId = paymentId;
          order.paymentInfo.paidAt = new Date();
          order.status = 'Confirmed';
          order.statusTimeline.push({
            status: 'Confirmed',
            comment: `Payment captured via Razorpay Webhook (${paymentId})`,
            timestamp: new Date()
          });

          await order.save();
          await decrementInventory(order.items);
          await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [] } });
        }
      }
    } else if (event === 'payment.failed') {
      const razorpayOrderId = payload.payment?.entity?.order_id;
      if (razorpayOrderId) {
        await Order.findOneAndUpdate(
          { 'paymentInfo.razorpayOrderId': razorpayOrderId },
          {
            $set: { 'paymentInfo.status': 'Failed' },
            $push: {
              statusTimeline: {
                status: 'Cancelled',
                comment: 'Payment failed at payment gateway.',
                timestamp: new Date()
              }
            }
          }
        );
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Webhook handler failed: ${error.message}`
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook
};
