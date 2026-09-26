import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import cartReducer from '../features/cart/cartSlice.js';
import wishlistReducer from '../features/wishlist/wishlistSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer
  },
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;
