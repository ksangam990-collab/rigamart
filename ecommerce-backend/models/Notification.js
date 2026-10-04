const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must belong to a user'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    type: {
      type: String,
      enum: {
        values: ['ORDER_STATUS', 'PROMO', 'PRICE_DROP', 'SECURITY', 'SYSTEM'],
        message: 'Invalid notification type'
      },
      default: 'ORDER_STATUS'
    },
    data: {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      },
      orderNumber: {
        type: String,
        trim: true
      },
      link: {
        type: String,
        trim: true
      },
      icon: {
        type: String,
        default: 'bell'
      }
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// High-speed compound index for user's unread notifications query
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
