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
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

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
const StyleguidePage = lazy(() => import('./pages/StyleguidePage.jsx'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage.jsx'));


function RouteLoadingFallback({ message = 'Loading...' }) {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-12 h-12 rounded-2xl bg-brand/20 animate-ping opacity-60 pointer-events-none" />
        <div className="relative z-10 transition-transform duration-300">
          <Logo variant="icon" size="md" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" />
        </div>
        <span className="text-xs text-muted font-medium tracking-wide">{message}</span>
      </div>
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
      <ErrorBoundary>
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
          <Route
            path="styleguide"
            element={
              <Suspense fallback={<RouteLoadingFallback message="Loading Styleguide..." />}>
                <StyleguidePage />
              </Suspense>
            }
          />

          {/* Guest Auth Routes */}
          <Route
            path="order-success"
            element={
              <Suspense fallback={<RouteLoadingFallback message="Loading Order Success..." />}>
                <OrderSuccessPage />
              </Suspense>
            }
          />
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
          <Route path="cart" element={<CartPage />} />
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
      </ErrorBoundary>
    </BrowserRouter>
  );
}
