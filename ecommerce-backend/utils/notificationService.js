const Notification = require('../models/Notification');

/**
 * Dispatch an in-app notification to a user asynchronously
 * @param {Object} params
 * @param {string|ObjectId} params.user - Target User ID
 * @param {string} params.title - Notification Title
 * @param {string} params.message - Notification Content Body
 * @param {string} [params.type='ORDER_STATUS'] - Notification category
 * @param {Object} [params.data={}] - Associated metadata (orderId, orderNumber, link, icon)
 * @returns {Promise<Object|null>} Created notification document or null on failure
 */
const createNotification = async ({ user, title, message, type = 'ORDER_STATUS', data = {} }) => {
  try {
    if (!user || !title || !message) {
      return null;
    }

    const notification = await Notification.create({
      user,
      title: title.trim(),
      message: message.trim(),
      type,
      data
    });

    return notification;
  } catch (error) {
    console.error('[NOTIFICATION DISPATCH ERROR]', error.message);
    return null;
  }
};

/**
 * Convenience helper to create order status notifications for buyers
 * @param {Object} order - Mongoose Order document
 * @param {string} status - New order status
 * @param {string} [customMessage] - Optional custom message
 */
const notifyOrderStatusChange = async (order, status, customMessage = '') => {
  if (!order || !order.user) return;

  const statusConfig = {
    Placed: {
      title: 'Order Placed! 🛍️',
      message: customMessage || `Order #${order.orderNumber} has been placed successfully.`,
      icon: 'package'
    },
    Confirmed: {
      title: 'Order Confirmed! 📦',
      message: customMessage || `Order #${order.orderNumber} is confirmed and is being prepared by the seller.`,
      icon: 'check'
    },
    Shipped: {
      title: 'Order Shipped! 🚚',
      message: customMessage || `Your order #${order.orderNumber} has been dispatched and is on its way.`,
      icon: 'truck'
    },
    Delivered: {
      title: 'Order Delivered! 🎉',
      message: customMessage || `Your order #${order.orderNumber} was delivered. Enjoy your purchase!`,
      icon: 'sparkles'
    },
    Cancelled: {
      title: 'Order Cancelled ⚠️',
      message: customMessage || `Order #${order.orderNumber} has been cancelled.`,
      icon: 'alert'
    },
    'Return Requested': {
      title: 'Return Request Received 🔄',
      message: customMessage || `Return requested for order #${order.orderNumber}. Pending seller review.`,
      icon: 'refresh'
    },
    Returned: {
      title: 'Order Refunded & Returned 🔄',
      message: customMessage || `Return and refund for order #${order.orderNumber} has been processed.`,
      icon: 'check'
    }
  };

  const config = statusConfig[status] || {
    title: `Order Updated: ${status}`,
    message: customMessage || `Status of order #${order.orderNumber} changed to ${status}.`,
    icon: 'bell'
  };

  return createNotification({
    user: order.user,
    title: config.title,
    message: config.message,
    type: 'ORDER_STATUS',
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      link: `/orders/${order._id}`,
      icon: config.icon
    }
  });
};

module.exports = {
  createNotification,
  notifyOrderStatusChange
};
