import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Tag,
  ShieldCheck,
  CheckCheck,
  Trash2,
  ExternalLink,
  ChevronRight,
  Clock
} from 'lucide-react';
import {
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../../features/notification/notificationSlice.js';
import { modalContentVariants } from '../../utils/animations.js';

// Format relative timestamps: "Just now", "5m ago", "2h ago", "Yesterday", "3d ago"
function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export default function NotificationDropdown({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const { notifications, unreadCount, isLoading } = useSelector(
    (state) => state.notification || { notifications: [], unreadCount: 0, isLoading: false }
  );

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const handleItemClick = (notification, e) => {
    // If click was on the delete button, ignore row navigation
    if (e.target.closest('.delete-btn')) return;

    if (!notification.isRead) {
      dispatch(markAsRead(notification._id));
    }
    onClose();

    const info = notification.data || notification.metadata || {};
    if (info.orderId) {
      navigate(`/orders/${info.orderId}`);
    } else if (info.link) {
      navigate(info.link);
    }
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    if (unreadCount > 0) {
      dispatch(markAllAsRead());
    }
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
  };

  const renderIcon = (notification) => {
    const info = notification.data || notification.metadata || {};
    const iconType = info.icon || '';
    const status = info.status || '';

    if (iconType === 'truck' || status === 'Shipped') {
      return (
        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
          <Truck className="w-4 h-4" />
        </div>
      );
    }

    if (iconType === 'check' || status === 'Confirmed') {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      );
    }

    if (iconType === 'sparkles' || status === 'Delivered') {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      );
    }

    if (iconType === 'alert' || status === 'Cancelled') {
      return (
        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }

    if (iconType === 'refresh' || status === 'Returned') {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
          <RotateCcw className="w-4 h-4" />
        </div>
      );
    }

    if (iconType === 'package' || status === 'Placed' || notification.type === 'ORDER_STATUS') {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <Package className="w-4 h-4" />
        </div>
      );
    }

    if (notification.type === 'PROMO') {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
      );
    }

    if (notification.type === 'PRICE_DROP') {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <Tag className="w-4 h-4" />
        </div>
      );
    }

    if (notification.type === 'SECURITY') {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
      );
    }

    return (
      <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
        <Bell className="w-4 h-4" />
      </div>
    );
  };

  return (
    <motion.div
      variants={modalContentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 origin-top-right text-left"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filter === 'all'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              filter === 'unread'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filter === 'unread' ? 'bg-brand-800 text-white' : 'bg-brand-100 text-brand-700'
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100 overscroll-contain">
        {isLoading && notifications.length === 0 ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-200 rounded w-full" />
                  <div className="h-2 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-xs text-gray-500 mt-1 max-w-[220px] mx-auto">
              {filter === 'unread'
                ? "You've read all your updates. Switch to 'All' to review past notices."
                : "We'll let you know when your orders update or special deals arrive."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item._id}
              onClick={(e) => handleItemClick(item, e)}
              className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group relative ${
                !item.isRead
                  ? 'bg-brand-50/40 hover:bg-brand-50/70 border-l-2 border-brand-600'
                  : 'hover:bg-gray-50 border-l-2 border-transparent'
              }`}
            >
              {renderIcon(item)}

              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p
                    className={`text-xs font-semibold truncate ${
                      !item.isRead ? 'text-gray-900 font-bold' : 'text-gray-700'
                    }`}
                  >
                    {item.title}
                  </p>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>

                {(item.data?.orderNumber || item.metadata?.orderNumber) && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      Order #{item.data?.orderNumber || item.metadata?.orderNumber}
                    </span>
                    <span className="text-[10px] font-semibold text-brand-600 flex items-center gap-0.5 group-hover:underline">
                      Track <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>

              {/* Unread dot / Delete button */}
              <div className="shrink-0 flex items-center gap-1 self-center">
                {!item.isRead && (
                  <span
                    className="w-2 h-2 rounded-full bg-brand-600 shrink-0 group-hover:hidden"
                    title="Unread"
                  />
                )}
                <button
                  type="button"
                  onClick={(e) => handleDelete(item._id, e)}
                  className="delete-btn p-1 text-gray-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete notification"
                  aria-label="Delete notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/my-orders');
          }}
          className="text-xs font-semibold text-gray-700 hover:text-brand-600 transition-colors flex items-center gap-1 px-2 py-1 rounded"
        >
          <Package className="w-3.5 h-3.5 text-gray-500" />
          View My Orders
        </button>

        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-gray-500 hover:text-gray-800 px-2 py-1 rounded transition-colors"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}
