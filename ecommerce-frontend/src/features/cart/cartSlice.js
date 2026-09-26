import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

const initialState = {
  items: [],
  itemsPrice: 0,
  shippingPrice: 0,
  taxPrice: 0,
  totalAmount: 0,
  totalCount: 0,
  isLoading: false,
  error: null
};

// Async Thunks
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/cart');
    return res.data.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, variantId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const res = await api.post('/cart/add', { productId, variantId, quantity });
      return res.data.data.cart;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const res = await api.put('/cart/update', { itemId, quantity });
      return res.data.data.cart;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update item quantity');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/cart/remove/${itemId}`);
      return res.data.data.cart;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove item from cart');
    }
  }
);

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    const res = await api.delete('/cart/clear');
    return res.data.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to clear cart');
  }
});

const calculateTotalCount = (items = []) => {
  return items.reduce((total, item) => total + (item.quantity || 0), 0);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCartState: () => initialState
  },
  extraReducers: (builder) => {
    const handleCartFulfilled = (state, action) => {
      state.isLoading = false;
      const cart = action.payload || {};
      const summary = cart.summary || {};
      state.items = cart.items || [];
      state.itemsPrice = summary.itemsPrice ?? cart.itemsPrice ?? 0;
      state.shippingPrice = summary.shippingPrice ?? cart.shippingPrice ?? 0;
      state.taxPrice = summary.taxPrice ?? cart.taxPrice ?? 0;
      state.totalAmount = summary.totalAmount ?? cart.totalAmount ?? 0;
      state.totalCount = summary.totalQuantity ?? calculateTotalCount(cart.items);
    };

    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, handleCartFulfilled)
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, handleCartFulfilled)
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Quantity
      .addCase(updateCartQuantity.fulfilled, handleCartFulfilled)
      // Remove Item
      .addCase(removeFromCart.fulfilled, handleCartFulfilled)
      // Clear Cart
      .addCase(clearCart.fulfilled, handleCartFulfilled);
  }
});

export const { resetCartState } = cartSlice.actions;
export default cartSlice.reducer;
