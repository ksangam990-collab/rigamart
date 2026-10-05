import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

const getLocalWishlist = () => {
  try {
    const raw = localStorage.getItem('rigamart_guest_wishlist');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalWishlist = (items) => {
  try {
    localStorage.setItem('rigamart_guest_wishlist', JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save guest wishlist to localStorage', e);
  }
};

const initialState = {
  items: getLocalWishlist(),
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/users/wishlist');
      const serverItems = res.data.data?.wishlist || [];

      // Auto-merge any local guest wishlist items to server
      const localItems = getLocalWishlist();
      if (localItems.length > 0) {
        for (const item of localItems) {
          const id = typeof item === 'object' ? item._id : item;
          const alreadyOnServer = serverItems.some((s) => {
            const sId = typeof s === 'object' ? s._id : s;
            return sId?.toString() === id?.toString();
          });
          if (!alreadyOnServer && id) {
            try {
              await api.post(`/users/wishlist/${id}`);
            } catch {}
          }
        }
        localStorage.removeItem('rigamart_guest_wishlist');
        // Re-fetch merged list
        const mergedRes = await api.get('/users/wishlist');
        return mergedRes.data.data?.wishlist || serverItems;
      }

      return serverItems;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch wishlist'
      );
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggleWishlist',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentItems = state.wishlist?.items || [];
      const isAlreadyInWishlist = currentItems.some((item) => {
        const id = typeof item === 'object' ? item._id : item;
        return id?.toString() === productId?.toString();
      });

      let res;
      if (isAlreadyInWishlist) {
        res = await api.delete(`/users/wishlist/${productId}`);
      } else {
        res = await api.post(`/users/wishlist/${productId}`);
      }

      return res.data.data?.wishlist || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update wishlist'
      );
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/users/wishlist/${productId}`);
      return res.data.data?.wishlist || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to add to wishlist'
      );
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/users/wishlist/${productId}`);
      return res.data.data?.wishlist || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to remove from wishlist'
      );
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    resetWishlistState: (state) => {
      state.items = [];
      state.isLoading = false;
      state.error = null;
      try {
        localStorage.removeItem('rigamart_guest_wishlist');
      } catch {}
    },
    toggleGuestWishlist: (state, action) => {
      const product = action.payload;
      const productId = typeof product === 'object' ? product._id : product;
      const exists = state.items.some((item) => {
        const id = typeof item === 'object' ? item._id : item;
        return id?.toString() === productId?.toString();
      });

      if (exists) {
        state.items = state.items.filter((item) => {
          const id = typeof item === 'object' ? item._id : item;
          return id?.toString() !== productId?.toString();
        });
      } else {
        state.items.push(product);
      }
      saveLocalWishlist(state.items);
    },
  },
  extraReducers: (builder) => {
    const handleWishlistFulfilled = (state, action) => {
      state.isLoading = false;
      state.items = action.payload || [];
    };

    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, handleWishlistFulfilled)
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Toggle Wishlist
      .addCase(toggleWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleWishlist.fulfilled, handleWishlistFulfilled)
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Direct Add & Remove
      .addCase(addToWishlist.fulfilled, handleWishlistFulfilled)
      .addCase(removeFromWishlist.fulfilled, handleWishlistFulfilled);
  },
});

export const { resetWishlistState, toggleGuestWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
