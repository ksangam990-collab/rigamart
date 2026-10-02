import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  Store,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { logoutUser } from '../../features/auth/authSlice.js';
import Logo from '../common/Logo.jsx';
import {
  buttonHover,
  buttonTap,
  drawerSlideDown,
  modalContentVariants,
  badgePulse
} from '../../utils/animations.js';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartTotalCount = useSelector((state) => state.cart.totalCount);
  const wishlistCount = useSelector((state) => state.wishlist.items.length);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Scroll listener for sticky glassmorphism backdrop blur & shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-b border-gray-200'
          : 'bg-white border-b border-gray-200 shadow-sm'
      }`}
    >
      {/* Top Banner for Trust / Free Delivery (collapses smoothly on scroll) */}
      <div
        className={`bg-brand-600 text-white text-xs text-center font-medium tracking-wide transition-all duration-300 overflow-hidden ${
          isScrolled
            ? 'max-h-0 py-0 opacity-0 pointer-events-none'
            : 'max-h-10 py-1.5 px-4 opacity-100'
        }`}
      >
        ⚡ Super Saver Sale: Free delivery across India on orders above ₹500!
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between gap-4 transition-all duration-300 ${
            isScrolled ? 'h-14' : 'h-16'
          }`}
        >
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className={`transition-transform duration-300 origin-left ${
                  isScrolled ? 'scale-95' : 'scale-100'
                }`}
              >
                <Logo variant="full" size="responsive" />
              </motion.div>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl relative items-center"
          >
            <input
              type="text"
              placeholder="Search for products, brands, and categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-gray-100 hover:bg-gray-50 focus:bg-white rounded-lg pl-10 pr-20 border border-transparent focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all text-gray-800 ${
                isScrolled ? 'py-2 text-xs' : 'py-2.5 text-sm'
              }`}
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className={`absolute right-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-md transition-all shadow-sm ${
                isScrolled ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
              }`}
            >
              Search
            </motion.button>
          </form>

          {/* User Actions & Badges */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Wishlist Icon */}
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
              <Link
                to="/wishlist"
                className="relative p-2 text-gray-600 hover:text-brand-600 transition-colors rounded-full hover:bg-gray-100 flex items-center justify-center"
                title="Wishlist"
              >
                <Heart className="w-5 h-5 transition-transform duration-150 hover:text-rose-500" />
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span
                      key={wishlistCount}
                      variants={badgePulse}
                      initial="initial"
                      animate="animate"
                      exit={{ scale: 0 }}
                      className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>

            {/* Shopping Cart Icon with Live Badge */}
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-brand-600 transition-colors rounded-full hover:bg-gray-100 flex items-center justify-center"
                title="Cart"
              >
                <ShoppingCart className="w-5 h-5 transition-colors" />
                <AnimatePresence>
                  {cartTotalCount > 0 && (
                    <motion.span
                      key={cartTotalCount}
                      variants={badgePulse}
                      initial="initial"
                      animate="animate"
                      exit={{ scale: 0 }}
                      className="absolute top-1 right-1 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                    >
                      {cartTotalCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>

            {/* Authenticated User Dropdown or Guest Auth Buttons */}
            {isAuthenticated && user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1 px-2.5 rounded-lg border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </motion.button>

                {/* Dropdown Menu Animated with AnimatePresence */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      variants={modalContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 origin-top-right"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          {user.role}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-brand-500" />
                        My Profile
                      </Link>

                      <Link
                        to="/my-orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Package className="w-4 h-4 text-gray-500" />
                        My Orders
                      </Link>

                      {(user.role === 'seller' || user.role === 'admin') && (
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Store className="w-4 h-4 text-indigo-500" />
                          Seller Dashboard
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          Admin Portal
                        </Link>
                      )}

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 text-sm font-semibold text-gray-700 hover:text-brand-600 transition-colors"
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all inline-block"
                  >
                    Register
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 text-sm rounded-lg pl-9 pr-16 py-2 border border-transparent focus:bg-white focus:border-brand-500 focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.94 }}
              className="absolute right-1 px-2.5 py-1 bg-brand-600 text-white text-xs font-semibold rounded shadow-sm"
            >
              Go
            </motion.button>
          </form>
        </div>

        {/* Mobile Slide-Down Menu Animated with AnimatePresence */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              variants={drawerSlideDown}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden border-t border-gray-100 py-3 px-2 space-y-2 bg-white"
            >
              {isAuthenticated ? (
                <div className="space-y-1">
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500">Signed in as</div>
                    <div className="text-sm font-semibold text-gray-900">{user?.name || user?.email}</div>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-600">
                      {user?.role}
                    </span>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4 text-brand-500" />
                    My Profile
                  </Link>
                  <Link
                    to="/my-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Package className="w-4 h-4 text-gray-500" />
                    My Orders
                  </Link>
                  {(user?.role === 'seller' || user?.role === 'admin') && (
                    <Link
                      to="/seller/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Store className="w-4 h-4 text-indigo-500" />
                      Seller Dashboard
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Admin Portal
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
                  <motion.div whileTap={{ scale: 0.96 }}>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-center w-full"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.96 }}>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-sm text-center w-full"
                    >
                      Register
                    </Link>
                  </motion.div>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2 space-y-1 text-xs text-gray-600">
                <Link
                  to="/catalog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-1.5 hover:text-brand-600 transition-colors"
                >
                  📦 Explore All Products
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-1.5 hover:text-brand-600 transition-colors"
                >
                  ❤️ Saved Wishlist ({wishlistCount})
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
