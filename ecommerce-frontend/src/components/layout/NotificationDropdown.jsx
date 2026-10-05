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
        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Truck className="w-4 h-4" />
        </div>
      );
    }

    if (iconType === 'check' || status === 'Confirmed') {
      return (
        <div className="w-8 h-8 rounded-full bg-brand-soft text-brand-dark flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      );
    }

    if (iconType === 'sparkles' || status === 'Delivered') {
      return (
        <div className="w-8 h-8 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      );
    }

    if (iconType === 'alert' || status === 'Cancelled') {
      return (
        <div className="w-8 h-8 rounded-full bg-danger/15 text-danger flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }

    if (iconType === 'rotate' || status === 'Returned') {
      return (
        <div className="w-8 h-8 rounded-full bg-line/60 text-muted flex items-center justify-center shrink-0">
          <RotateCcw className="w-4 h-4" />
        </div>
      );
    }

    if (iconType === 'tag') {
      return (
        <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
          <Tag className="w-4 h-4" />
        </div>
      );
    }

    if (iconType === 'shield') {
      return (
        <div className="w-8 h-8 rounded-full bg-brand-soft text-brand-dark flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
      );
    }

    return (
      <div className="w-8 h-8 rounded-full bg-brand-soft text-brand-dark flex items-center justify-center shrink-0">
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
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface rounded-2xl shadow-elevation border border-line overflow-hidden z-50 origin-top-right text-left"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-surface border-b border-line">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-ink">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-accent text-ink text-[10px] font-bold px-2 py-0.5 rounded-full shadow-subtle">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-brand hover:text-brand-dark flex items-center gap-1 transition-colors"
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
                ? 'bg-ink text-canvas shadow-subtle'
                : 'bg-canvas text-muted hover:text-ink'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              filter === 'unread'
                ? 'bg-brand text-white shadow-subtle'
                : 'bg-canvas text-muted hover:text-ink'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filter === 'unread' ? 'bg-brand-dark text-white' : 'bg-brand-soft text-brand-dark'
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-line overscroll-contain">
        {isLoading && notifications.length === 0 ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-line/60 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-line/60 rounded w-3/4" />
                  <div className="h-2.5 bg-line/60 rounded w-full" />
                  <div className="h-2 bg-line/60 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-canvas text-muted mx-auto flex items-center justify-center mb-3 border border-line">
              <Bell className="w-6 h-6 text-muted" />
            </div>
            <p className="text-sm font-semibold text-ink">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-xs text-muted mt-1 max-w-[220px] mx-auto">
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
                  ? 'bg-brand-soft/40 hover:bg-brand-soft/60 border-l-2 border-brand'
                  : 'hover:bg-canvas border-l-2 border-transparent'
              }`}
            >
              {renderIcon(item)}

              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p
                    className={`text-xs truncate ${
                      !item.isRead ? 'text-ink font-bold' : 'text-ink/80 font-medium'
                    }`}
                  >
                    {item.title}
                  </p>
                  <span className="text-[10px] text-muted whitespace-nowrap shrink-0 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                  {item.message}
                </p>

                {(item.data?.orderNumber || item.metadata?.orderNumber) && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-canvas text-muted border border-line">
                      Order #{item.data?.orderNumber || item.metadata?.orderNumber}
                    </span>
                    <span className="text-[10px] font-semibold text-brand flex items-center gap-0.5 group-hover:underline">
                      Track <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>

              {/* Unread dot / Delete button */}
              <div className="shrink-0 flex items-center gap-1 self-center">
                {!item.isRead && (
                  <span
                    className="w-2 h-2 rounded-full bg-brand shrink-0 group-hover:hidden"
                    title="Unread"
                  />
                )}
                <button
                  type="button"
                  onClick={(e) => handleDelete(item._id, e)}
                  className="delete-btn p-1 text-muted hover:text-danger rounded-md hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"
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
      <div className="p-2.5 bg-canvas border-t border-line flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/my-orders');
          }}
          className="text-xs font-semibold text-ink hover:text-brand transition-colors flex items-center gap-1 px-2 py-1 rounded"
        >
          <Package className="w-3.5 h-3.5 text-muted" />
          View My Orders
        </button>

        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-muted hover:text-ink px-2 py-1 rounded transition-colors"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}
