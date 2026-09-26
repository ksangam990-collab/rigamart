import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

const initialState = {
  items: [],
  isLoading: false,
  error: null
};

// Async Thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/users/wishlist');
      return res.data.data?.wishlist || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch wishlist');
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
      return rejectWithValue(err.response?.data?.message || 'Failed to update wishlist');
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
      return rejectWithValue(err.response?.data?.message || 'Failed to add to wishlist');
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
      return rejectWithValue(err.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    resetWishlistState: () => initialState
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
  }
});

export const { resetWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
