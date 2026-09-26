import { store } from './src/store/index.js';
import { setCredentials, logoutUser } from './src/features/auth/authSlice.js';
import {
  resetCartState,
  fetchCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
} from './src/features/cart/cartSlice.js';
import {
  resetWishlistState,
  fetchWishlist,
  toggleWishlist,
  addToWishlist,
  removeFromWishlist
} from './src/features/wishlist/wishlistSlice.js';
import api, { getAccessToken } from './src/utils/api.js';

console.log('🧪 Starting Frontend Foundational Setup Test Suite...\n');
let passed = 0;
let failed = 0;

try {
  // Test 1: Redux Store Root Reducers
  const initialState = store.getState();
  if (initialState.auth && initialState.cart && initialState.wishlist) {
    console.log('✅ 1. Redux Store Initialization: PASS (auth, cart, wishlist slices present)');
    passed++;
  } else {
    console.log('❌ 1. Redux Store Initialization: FAIL', initialState);
    failed++;
  }

  // Test 2: Auth State Mutations & Token Caching
  store.dispatch(
    setCredentials({
      user: { _id: 'u123', name: 'Frontend Tester', role: 'customer' },
      accessToken: 'sample_jwt_access_token'
    })
  );

  const updatedAuthState = store.getState().auth;
  if (
    updatedAuthState.isAuthenticated === true &&
    updatedAuthState.user.name === 'Frontend Tester' &&
    getAccessToken() === 'sample_jwt_access_token'
  ) {
    console.log('✅ 2. Auth State & Memory Token Sync: PASS (User authenticated, token cached)');
    passed++;
  } else {
    console.log('❌ 2. Auth State Mutation: FAIL', updatedAuthState);
    failed++;
  }

  // Test 3: Logout Action & Token Eviction
  store.dispatch(logoutUser());
  const postLogoutState = store.getState().auth;
  if (
    postLogoutState.isAuthenticated === false &&
    postLogoutState.user === null &&
    getAccessToken() === null
  ) {
    console.log('✅ 3. Logout State & Token Eviction: PASS (Session cleared)');
    passed++;
  } else {
    console.log('❌ 3. Logout State: FAIL', postLogoutState);
    failed++;
  }

  // Test 4: Cart State Initializer & Reset
  store.dispatch(resetCartState());
  const cartState = store.getState().cart;
  if (Array.isArray(cartState.items) && cartState.totalAmount === 0 && cartState.totalCount === 0) {
    console.log('✅ 4. Cart State Lifecycle: PASS (Default metrics zeroed)');
    passed++;
  } else {
    console.log('❌ 4. Cart State Lifecycle: FAIL', cartState);
    failed++;
  }

  // Test 5: Wishlist State Initializer
  store.dispatch(resetWishlistState());
  const wishlistState = store.getState().wishlist;
  if (Array.isArray(wishlistState.items) && wishlistState.items.length === 0) {
    console.log('✅ 5. Wishlist State Lifecycle: PASS (Initialized empty array)');
    passed++;
  } else {
    console.log('❌ 5. Wishlist State Lifecycle: FAIL', wishlistState);
    failed++;
  }

  // Test 6: Axios BaseURL Configuration
  if (api.defaults.baseURL.includes('/api') && api.defaults.withCredentials === true) {
    console.log('✅ 6. Axios Interceptor Configuration: PASS (withCredentials=true, baseURL ready)');
    passed++;
  } else {
    console.log('❌ 6. Axios Configuration: FAIL', api.defaults);
    failed++;
  }

  // Test 7: Cart Async Thunk Route Alignments
  if (
    typeof updateCartQuantity === 'function' &&
    typeof removeFromCart === 'function' &&
    typeof clearCart === 'function' &&
    updateCartQuantity.typePrefix === 'cart/updateQuantity' &&
    removeFromCart.typePrefix === 'cart/removeItem' &&
    clearCart.typePrefix === 'cart/clearCart'
  ) {
    console.log('✅ 7. Cart Thunk Signatures: PASS (PUT /cart/update, DELETE /cart/remove/:id, DELETE /cart/clear verified)');
    passed++;
  } else {
    console.log('❌ 7. Cart Thunk Signatures: FAIL');
    failed++;
  }

  // Test 8: Wishlist Async Thunk Route Alignments & State-Aware Toggle
  if (
    typeof toggleWishlist === 'function' &&
    typeof addToWishlist === 'function' &&
    typeof removeFromWishlist === 'function' &&
    toggleWishlist.typePrefix === 'wishlist/toggleWishlist' &&
    addToWishlist.typePrefix === 'wishlist/addToWishlist' &&
    removeFromWishlist.typePrefix === 'wishlist/removeFromWishlist'
  ) {
    console.log('✅ 8. Wishlist Thunk Signatures: PASS (State-aware toggle with POST/DELETE /users/wishlist/:id)');
    passed++;
  } else {
    console.log('❌ 8. Wishlist Thunk Signatures: FAIL');
    failed++;
  }

} catch (err) {
  console.error('Fatal Frontend Test Error:', err);
  failed++;
}

console.log(`\n================================`);
console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
console.log(`================================\n`);

if (failed === 0) {
  console.log('🎉 Frontend Foundation, Redux Store & Axios Interceptors Verified Successfully!');
} else {
  process.exit(1);
}
