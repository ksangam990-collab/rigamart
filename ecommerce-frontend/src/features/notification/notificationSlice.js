import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  pagination: null
};

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = params;
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(unreadOnly ? { unreadOnly: 'true' } : {})
      }).toString();

      const res = await api.get(`/notifications?${query}`);
      return res.data?.data || { notifications: [], unreadCount: 0 };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/notifications/unread-count');
      return res.data?.data?.unreadCount || 0;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const res = await api.put(`/notifications/${notificationId}/read`);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.put('/notifications/mark-all-read');
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/notifications/${notificationId}`);
      return { id: notificationId, ...(res.data?.data || {}) };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete notification');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    resetNotificationState: () => initialState,
    receiveNotification: (state, action) => {
      if (action.payload) {
        state.notifications.unshift(action.payload);
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount ?? state.unreadCount;
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Unread Count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // Mark As Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const updated = action.payload?.notification;
        if (updated) {
          const index = state.notifications.findIndex((n) => n._id === updated._id);
          if (index !== -1) {
            state.notifications[index] = updated;
          }
        }
        if (typeof action.payload?.unreadCount === 'number') {
          state.unreadCount = action.payload.unreadCount;
        } else if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })

      // Mark All As Read
      .addCase(markAllAsRead.fulfilled, (state, action) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString()
        }));
        state.unreadCount = 0;
      })

      // Delete Notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload.id;
        state.notifications = state.notifications.filter((n) => n._id !== id);
        if (typeof action.payload?.unreadCount === 'number') {
          state.unreadCount = action.payload.unreadCount;
        }
      });
  }
});

export const { resetNotificationState, receiveNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
