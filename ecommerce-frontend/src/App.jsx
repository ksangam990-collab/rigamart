import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './features/auth/authSlice.js';
import { fetchCart } from './features/cart/cartSlice.js';
import { fetchWishlist } from './features/wishlist/wishlistSlice.js';

import Layout from './components/layout/Layout.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import PublicRoute from './components/common/PublicRoute.jsx';
import Logo from './components/common/Logo.jsx';

import HomePage from './pages/HomePage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import UnauthorizedPage from './pages/UnauthorizedPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import CartPage from './pages/CartPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';

// Code-split dynamic routes
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage.jsx'));
const SellerDashboardPage = lazy(() => import('./pages/SellerDashboardPage.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage.jsx'));

// Static / marketing pages (code-split)
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const HelpPage = lazy(() => import('./pages/HelpPage.jsx'));
const SellPage = lazy(() => import('./pages/SellPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'));
const TermsPage = lazy(() => import('./pages/TermsPage.jsx'));


function RouteLoadingFallback({ message = 'Loading...' }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 animate-pulse">
        <Logo variant="icon" size="sm" />
      </div>
      <span className="text-xs text-gray-400 font-medium tracking-wide">{message}</span>
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Attempt silent session recovery via httpOnly cookie on boot
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    // Load customer cart & wishlist when authenticated
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Storefront Routes */}
          <Route index element={<HomePage />} />
          <Route path="search" element={<CatalogPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="unauthorized" element={<UnauthorizedPage />} />

          {/* Static / Marketing Routes */}
          <Route
            path="about"
            element={
              <Suspense fallback={<RouteLoadingFallback message="Loading..." />}>
                <AboutPage />
              </Suspense>
            }
          />
          <Route
            path="help"
            element={
              <Suspense fallback={<RouteLoadingFallback message="Loading Help Center..." />}>
                <HelpPage />
              </Suspense>
            }
          />
          <Route
            path="sell"
            element={
              <Suspense fallback={<RouteLoadingFallback message="Loading..." />}>
                <SellPage />
              </Suspense>
            }
          />
          <Route
            path="privacy"
            element={
              <Suspense fallback={<RouteLoadingFallback message="Loading..." />}>
                <PrivacyPage />
              </Suspense>
            }
          />
          <Route
            path="terms"
            element={
              <Suspense fallback={<RouteLoadingFallback message="Loading..." />}>
                <TermsPage />
              </Suspense>
            }
          />

          {/* Guest Auth Routes */}
          <Route
            path="login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected Customer Routes */}
          <Route
            path="my-orders"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingFallback message="Loading your orders..." />}>
                  <MyOrdersPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingFallback message="Loading your profile..." />}>
                  <ProfilePage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/:id"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingFallback message="Loading order details..." />}>
                  <OrderDetailPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Seller Portal */}
          <Route
            path="seller/dashboard"
            element={
              <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <Suspense fallback={<RouteLoadingFallback message="Opening Seller Central..." />}>
                  <SellerDashboardPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Portal */}
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Suspense fallback={<RouteLoadingFallback message="Opening Admin Moderation..." />}>
                  <AdminDashboardPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
