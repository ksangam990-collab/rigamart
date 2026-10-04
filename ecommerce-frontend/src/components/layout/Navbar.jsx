import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  Loader2,
  Tag,
  ArrowRight,
  Star,
  Bell
} from 'lucide-react';
import { logoutUser } from '../../features/auth/authSlice.js';
import {
  fetchNotifications,
  fetchUnreadCount,
  resetNotificationState
} from '../../features/notification/notificationSlice.js';
import NotificationDropdown from './NotificationDropdown.jsx';
import api from '../../utils/api.js';
import Logo from '../common/Logo.jsx';
import {
  buttonHover,
  buttonTap,
  drawerSlideDown,
  modalContentVariants,
  badgePulse
} from '../../utils/animations.js';

function SearchSuggestionsDropdown({
  show,
  isSearching,
  searchQuery,
  suggestions,
  selectedIndex,
  setSelectedIndex,
  onSelectCategory,
  onSelectProduct,
  onSubmitSearch
}) {
  if (!show) return null;

  const totalCategories = suggestions.categories?.length || 0;
  const totalProducts = suggestions.products?.length || 0;
  const hasResults = totalCategories > 0 || totalProducts > 0;
  const viewAllIndex = totalCategories + totalProducts;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.99 }}
          transition={{ duration: 0.15 }}
          className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 divide-y divide-gray-100 max-h-[440px] overflow-y-auto text-left"
        >
          {/* Categories Section */}
          {totalCategories > 0 && (
            <div className="p-2.5 bg-gray-50/70">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 pb-1.5 flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-brand-500" />
                Categories
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.categories.map((cat, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      key={cat._id || cat.slug}
                      type="button"
                      onClick={() => onSelectCategory(cat.slug)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-white hover:bg-brand-50 text-gray-700 hover:text-brand-600 border border-gray-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Products Section */}
          {totalProducts > 0 && (
            <div className="py-1">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3.5 py-1">
                Products
              </div>
              <div className="space-y-0.5">
                {suggestions.products.map((prod, idx) => {
                  const itemIndex = totalCategories + idx;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <div
                      key={prod._id}
                      onClick={() => onSelectProduct(prod._id)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`flex items-center gap-3 px-3.5 py-2 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-brand-50 text-brand-900 border-l-2 border-brand-600'
                          : 'hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {prod.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider truncate">
                            {prod.brand || prod.category?.name || 'Rigamart'}
                          </span>
                          {prod.avgRating > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-semibold">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              {prod.avgRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-brand-700">
                          ₹{prod.basePrice?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isSearching && !hasResults && searchQuery.trim().length >= 2 && (
            <div className="py-5 px-4 text-center text-xs text-gray-500">
              <p className="font-semibold text-gray-700">No matching products or categories</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Press Enter or click below to search the catalog
              </p>
            </div>
          )}

          {/* "View All Results" Footer */}
          {searchQuery.trim().length >= 2 && (
            <button
              type="button"
              onClick={onSubmitSearch}
              onMouseEnter={() => setSelectedIndex(viewAllIndex)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-brand-600 transition-colors ${
                selectedIndex === viewAllIndex
                  ? 'bg-brand-50'
                  : 'hover:bg-brand-50/60 bg-gray-50/50'
              }`}
            >
              <span>
                View all results for &ldquo;
                <span className="text-brand-800 underline">{searchQuery.trim()}</span>
                &rdquo;
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBannerCollapsed, setIsBannerCollapsed] = useState(false);

  // Predictive search autocomplete states
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const notificationRef = useRef(null);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartTotalCount = useSelector((state) => state.cart.totalCount);
  const wishlistCount = useSelector((state) => state.wishlist.items.length);
  const unreadCount = useSelector((state) => state.notification?.unreadCount ?? 0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Notification polling effect (every 30 seconds when authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, dispatch]);

  const handleToggleNotifications = () => {
    if (!notificationDropdownOpen) {
      dispatch(fetchNotifications({ limit: 20 }));
    }
    setNotificationDropdownOpen((prev) => !prev);
    setUserDropdownOpen(false);
  };

  // Debounced search suggestions fetcher (250ms)
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions({ products: [], categories: [] });
      setShowDropdown(false);
      setIsSearching(false);
      setSelectedIndex(-1);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const res = await api.get('/products/suggestions', {
          params: { q: searchQuery.trim() }
        });
        if (res.data?.success) {
          setSuggestions(res.data.data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Failed to fetch search suggestions:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Dismiss dropdowns on outside clicks
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchRef.current && !searchRef.current.contains(e.target) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Flatten selectable items for keyboard navigation
  const getSelectableItems = () => {
    const items = [];
    (suggestions.categories || []).forEach((cat) => {
      items.push({ type: 'category', data: cat });
    });
    (suggestions.products || []).forEach((prod) => {
      items.push({ type: 'product', data: prod });
    });
    if (searchQuery.trim().length >= 2) {
      items.push({ type: 'view_all', query: searchQuery.trim() });
    }
    return items;
  };

  const handleKeyDown = (e) => {
    const items = getSelectableItems();
    if (!showDropdown || items.length === 0) {
      if (e.key === 'Escape') setShowDropdown(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
      setSelectedIndex(-1);
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        e.preventDefault();
        const item = items[selectedIndex];
        if (item.type === 'category') {
          navigate(`/search?category=${encodeURIComponent(item.data.slug)}`);
        } else if (item.type === 'product') {
          navigate(`/products/${item.data._id}`);
        } else if (item.type === 'view_all') {
          navigate(`/search?q=${encodeURIComponent(item.query)}`);
        }
        setShowDropdown(false);
        setSelectedIndex(-1);
        setMobileMenuOpen(false);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions({ products: [], categories: [] });
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleSelectCategory = (slug) => {
    navigate(`/search?category=${encodeURIComponent(slug)}`);
    setShowDropdown(false);
    setMobileMenuOpen(false);
  };

  const handleSelectProduct = (productId) => {
    navigate(`/products/${productId}`);
    setShowDropdown(false);
    setMobileMenuOpen(false);
  };

  // RAF-throttled scroll listener with dual-threshold hysteresis
  // Decouples visual elevation from banner collapse and prevents layout-shift oscillation
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // 1. Elevation shadow hysteresis: turn on at > 25px, turn off only when back at < 10px
          setIsScrolled((prev) => {
            if (!prev && currentScrollY > 25) return true;
            if (prev && currentScrollY < 10) return false;
            return prev;
          });

          // 2. Banner collapse hysteresis: collapse at > 80px, re-expand only when back at < 20px
          // The 60px hysteresis gap strictly exceeds the ~40px header height delta,
          // making threshold oscillation mathematically impossible.
          setIsBannerCollapsed((prev) => {
            if (!prev && currentScrollY > 80) return true;
            if (prev && currentScrollY < 20) return false;
            return prev;
          });

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(resetNotificationState());
    setUserDropdownOpen(false);
    setNotificationDropdownOpen(false);
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
          isBannerCollapsed
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
            isBannerCollapsed ? 'h-14' : 'h-16'
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
                  isBannerCollapsed ? 'scale-95' : 'scale-100'
                }`}
              >
                <Logo variant="full" size="responsive" />
              </motion.div>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <form
            ref={searchRef}
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl relative items-center"
            role="combobox"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
          >
            <input
              type="text"
              placeholder="Search for products, brands, and categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.products.length > 0 || suggestions.categories.length > 0) {
                  setShowDropdown(true);
                }
              }}
              onKeyDown={handleKeyDown}
              className={`w-full bg-gray-100 hover:bg-gray-50 focus:bg-white rounded-lg pl-10 pr-24 border border-transparent focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all text-gray-800 ${
                isBannerCollapsed ? 'py-2 text-xs' : 'py-2.5 text-sm'
              }`}
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-brand-600 animate-spin absolute left-3.5 pointer-events-none" />
            ) : (
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
            )}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-16 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className={`absolute right-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-md transition-all shadow-sm ${
                isBannerCollapsed ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
              }`}
            >
              Search
            </motion.button>

            {/* Predictive Autocomplete Dropdown */}
            <SearchSuggestionsDropdown
              show={showDropdown}
              isSearching={isSearching}
              searchQuery={searchQuery}
              suggestions={suggestions}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              onSelectCategory={handleSelectCategory}
              onSelectProduct={handleSelectProduct}
              onSubmitSearch={handleSearchSubmit}
            />
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

            {/* Notification Bell with Live Unread Badge */}
            {isAuthenticated && (
              <div className="relative" ref={notificationRef}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleToggleNotifications}
                  className={`relative p-2 text-gray-600 hover:text-brand-600 transition-colors rounded-full hover:bg-gray-100 flex items-center justify-center ${
                    notificationDropdownOpen ? 'bg-gray-100 text-brand-600' : ''
                  }`}
                  title="Notifications"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5 transition-transform duration-150" />
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span
                        key={unreadCount}
                        variants={badgePulse}
                        initial="initial"
                        animate="animate"
                        exit={{ scale: 0 }}
                        className="absolute top-1 right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Animated Dropdown Drawer */}
                <AnimatePresence>
                  {notificationDropdownOpen && (
                    <NotificationDropdown
                      isOpen={notificationDropdownOpen}
                      onClose={() => setNotificationDropdownOpen(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}

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
        <div ref={mobileSearchRef} className="md:hidden pb-3 relative">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center"
            role="combobox"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
          >
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.products.length > 0 || suggestions.categories.length > 0) {
                  setShowDropdown(true);
                }
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-gray-100 text-sm rounded-lg pl-9 pr-24 py-2 border border-transparent focus:bg-white focus:border-brand-500 focus:outline-none transition-all"
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-brand-600 animate-spin absolute left-3 pointer-events-none" />
            ) : (
              <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            )}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-12 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.94 }}
              className="absolute right-1 px-3 py-1.5 min-h-[30px] bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-md shadow-sm flex items-center justify-center transition-colors"
              aria-label="Submit search"
            >
              Go
            </motion.button>

            {/* Predictive Autocomplete Dropdown (Mobile) */}
            <SearchSuggestionsDropdown
              show={showDropdown}
              isSearching={isSearching}
              searchQuery={searchQuery}
              suggestions={suggestions}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              onSelectCategory={handleSelectCategory}
              onSelectProduct={handleSelectProduct}
              onSubmitSearch={handleSearchSubmit}
            />
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
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleToggleNotifications();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-amber-500" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </button>
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
