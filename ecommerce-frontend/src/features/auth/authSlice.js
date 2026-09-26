import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { setAccessToken } from '../../utils/api.js';

const safeStorage = {
  getItem: (key) => {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem: (key, val) => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, val);
    } catch {}
  },
  removeItem: (key) => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    } catch {}
  }
};

// Retrieve cached user from localStorage on boot
const savedUser = safeStorage.getItem('rigamart_user');
let initialUser = null;
try {
  initialUser = savedUser ? JSON.parse(savedUser) : null;
} catch (e) {
  initialUser = null;
}

const initialState = {
  user: initialUser,
  accessToken: null,
  isAuthenticated: Boolean(initialUser),
  isLoading: false,
  error: null
};

// Async Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', formData);
      const { user, accessToken } = res.data.data;
      setAccessToken(accessToken);
      safeStorage.setItem('rigamart_user', JSON.stringify(user));
      return { user, accessToken };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', credentials);
      const { user, accessToken } = res.data.data;
      setAccessToken(accessToken);
      safeStorage.setItem('rigamart_user', JSON.stringify(user));
      return { user, accessToken };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  setAccessToken(null);
  safeStorage.removeItem('rigamart_user');
  try {
    await api.post('/auth/logout');
  } catch (e) {
    // Ignore errors on logout
  }
});

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      // First attempt to exchange cookie for access token
      const refreshRes = await api.post('/auth/refresh-token');
      const newAccessToken = refreshRes.data?.data?.accessToken;
      setAccessToken(newAccessToken);

      // Fetch fresh user profile
      const userRes = await api.get('/auth/me');
      const user = userRes.data.data.user;
      safeStorage.setItem('rigamart_user', JSON.stringify(user));
      return { user, accessToken: newAccessToken };
    } catch (err) {
      setAccessToken(null);
      safeStorage.removeItem('rigamart_user');
      return rejectWithValue('Session expired');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      setAccessToken(action.payload.accessToken);
      safeStorage.setItem('rigamart_user', JSON.stringify(action.payload.user));
    },
    resetAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      setAccessToken(null);
      safeStorage.removeItem('rigamart_user');
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Check Auth
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      });
  }
});

export const { clearError, setCredentials, resetAuth } = authSlice.actions;
export default authSlice.reducer;
