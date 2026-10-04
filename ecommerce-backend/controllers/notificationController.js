const Notification = require('../models/Notification');
const { getPagination } = require('../utils/paginate');

/**
 * @desc    Get user's notifications (sorted newest first)
 * @route   GET /api/notifications
 * @access  Private (Authenticated User)
 */
const getMyNotifications = async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const { page, limit, skip, getPaginationMeta } = getPagination(req.query, 20);

    const filter = { user: req.user._id };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const [notifications, totalCount, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user._id, isRead: false })
    ]);

    res.status(200).json({
      success: true,
      message: 'Notifications fetched successfully',
      data: {
        notifications,
        unreadCount,
        pagination: getPaginationMeta(totalCount)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch notifications: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Get quick count of unread notifications for badge counter
 * @route   GET /api/notifications/unread-count
 * @access  Private (Authenticated User)
 */
const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      message: 'Unread notification count retrieved',
      data: {
        unreadCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve unread notification count: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Mark a specific notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private (Authenticated User)
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        data: null
      });
    }

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notification,
        unreadCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to mark notification as read: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Mark all user's notifications as read
 * @route   PUT /api/notifications/mark-all-read
 * @access  Private (Authenticated User)
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        unreadCount: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to mark all notifications as read: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private (Authenticated User)
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        data: null
      });
    }

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
      data: {
        unreadCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to delete notification: ${error.message}`,
      data: null
    });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
