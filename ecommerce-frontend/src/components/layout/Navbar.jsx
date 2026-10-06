import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  Bell,
  Clock,
  TrendingUp,
  Sparkles,
  Sun,
  Moon,
  Layers
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
  buttonTap,
  drawerSlideDown,
  modalContentVariants,
  badgePulse
} from '../../utils/animations.js';

const RECENT_SEARCHES_KEY = 'rigamart_recent_searches';

const CURATED_CATEGORIES = [
  { name: 'All Collections', href: '/catalog', badge: null },
  { name: 'Electronics', href: '/search?category=electronics', badge: null },
  { name: 'Fashion', href: '/search?category=fashion', badge: null },
  { name: 'Footwear', href: '/search?category=footwear', badge: null },
  { name: 'Home & Kitchen', href: '/search?category=home-kitchen', badge: null },
  { name: 'Beauty & Wellness', href: '/search?category=beauty-health', badge: null },
  { name: 'Trending Now', href: '/search?sort=newest', badge: '🔥 Hot' },
  { name: 'Sell on Rigamart', href: '/sell', badge: 'Earn' },
];

const loadRecentSearches = () => {
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

function SearchSuggestionsDropdown({
  show,
  isSearching,
  searchQuery,
  suggestions,
  recentSearches = [],
  selectedIndex,
  setSelectedIndex,
  onSelectRecentSearch,
  onRemoveRecentSearch,
  onClearRecentSearches,
  onSelectCategory,
  onSelectProduct,
  onSubmitSearch
}) {
  if (!show) return null;

  const queryTrimmed = searchQuery.trim();
  const isQueryActive = queryTrimmed.length >= 2;

  const categories = suggestions.categories || [];
  const products = (suggestions.products || []).slice(0, 4);
  const hasResults = categories.length > 0 || products.length > 0;
  const viewAllIndex = categories.length + products.length;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.99 }}
          transition={{ duration: 0.15 }}
          className="absolute left-0 right-0 top-full mt-1.5 bg-surface rounded-xl shadow-elevation border border-line overflow-hidden z-50 divide-y divide-line max-h-[460px] overflow-y-auto text-left"
        >
          {/* SCENARIO A: EMPTY OR SHORT QUERY (< 2 CHARS) -> RECENT SEARCHES + POPULAR CATEGORIES */}
          {!isQueryActive && (
            <div className="divide-y divide-line">
              {/* Recent Search History */}
              {recentSearches.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-muted uppercase tracking-wider px-1 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-brand" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={onClearRecentSearches}
                      className="text-muted hover:text-danger lowercase font-normal transition-colors"
                    >
                      clear history
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    {recentSearches.map((term, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <div
                          key={term}
                          onClick={() => onSelectRecentSearch(term)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-brand-soft text-brand-dark'
                              : 'hover:bg-canvas text-ink'
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <Search className="w-3 h-3 text-muted shrink-0" />
                            {term}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => onRemoveRecentSearch(e, term)}
                            className="p-1 text-muted hover:text-danger rounded-full hover:bg-canvas transition-colors"
                            title="Remove from history"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Popular / Trending Categories Quick Filter Chips */}
              <div className="p-3 bg-canvas/60">
                <div className="text-[10px] font-bold text-muted uppercase tracking-wider px-1 pb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-accent" />
                  <span>Trending Categories</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CURATED_CATEGORIES.slice(1, 6).map((cat, idx) => {
                    const currentIndex = recentSearches.length + idx;
                    const isSelected = selectedIndex === currentIndex;
                    const slug = cat.href.split('=').pop();

                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => onSelectCategory(slug)}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                          isSelected
                            ? 'bg-brand text-white shadow-subtle'
                            : 'bg-surface hover:bg-brand-soft text-ink hover:text-brand-dark border border-line'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SCENARIO B: ACTIVE QUERY (>= 2 CHARS) -> PREDICTIVE RESULTS */}
          {isQueryActive && (
            <>
              {/* Searching Loading State */}
              {isSearching && (
                <div className="py-3 px-4 flex items-center justify-center gap-2 text-xs text-muted bg-canvas/40">
                  <Loader2 className="w-3.5 h-3.5 text-brand animate-spin" />
                  <span>Searching catalog...</span>
                </div>
              )}

              {/* Matching Categories Jump Links */}
              {categories.length > 0 && (
                <div className="p-2.5 bg-canvas/60">
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider px-1 pb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-brand" />
                    <span>Search in category</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat, idx) => {
                      const isSelected = selectedIndex === idx;

                      return (
                        <button
                          key={cat._id || cat.slug}
                          type="button"
                          onClick={() => onSelectCategory(cat.slug, queryTrimmed)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1 ${
                            isSelected
                              ? 'bg-brand text-white shadow-subtle'
                              : 'bg-surface hover:bg-brand-soft text-ink hover:text-brand-dark border border-line'
                          }`}
                        >
                          <span>{cat.name}</span>
                          <ArrowRight className="w-3 h-3 opacity-60" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top 4 Matching Products */}
              {products.length > 0 && (
                <div className="py-1">
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider px-3.5 py-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3 h-3 text-brand" />
                      Matching Products
                    </span>
                    <span className="text-muted lowercase font-normal">top results</span>
                  </div>
                  <div className="space-y-0.5">
                    {products.map((prod, idx) => {
                      const itemIndex = categories.length + idx;
                      const isSelected = selectedIndex === itemIndex;

                      return (
                        <div
                          key={prod._id}
                          onClick={() => onSelectProduct(prod)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center gap-3 px-3.5 py-2 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-brand-soft text-brand-dark border-l-2 border-brand'
                              : 'hover:bg-canvas text-ink'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-canvas overflow-hidden shrink-0 border border-line flex items-center justify-center p-0.5">
                            {prod.image ? (
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-full h-full object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-muted" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-ink truncate">
                              {prod.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted font-medium uppercase tracking-wider truncate">
                                {prod.brand || prod.category?.name || 'Rigamart'}
                              </span>
                              {prod.avgRating > 0 && (
                                <span className="flex items-center gap-0.5 text-[10px] text-ink font-semibold">
                                  <Star className="w-2.5 h-2.5 fill-accent text-accent" />
                                  {prod.avgRating.toFixed(1)}
                                </span>
                              )}
                              <span className="text-[10px] text-success font-medium bg-success/10 px-1 rounded">
                                In Stock
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-ink tabular-nums">
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
              {!isSearching && !hasResults && (
                <div className="py-5 px-4 text-center text-xs text-muted">
                  <p className="font-semibold text-ink">No matching products or categories</p>
                  <p className="text-[11px] text-muted mt-0.5">
                    Press Enter or click below to search catalog for &ldquo;{queryTrimmed}&rdquo;
                  </p>
                </div>
              )}

              {/* "View All Results" Footer */}
              <button
                type="button"
                onClick={onSubmitSearch}
                onMouseEnter={() => setSelectedIndex(viewAllIndex)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-brand transition-colors ${
                  selectedIndex === viewAllIndex
                    ? 'bg-brand-soft'
                    : 'hover:bg-brand-soft/60 bg-canvas/40'
                }`}
              >
                <span>
                  View all results for &ldquo;
                  <span className="text-brand-dark underline">{queryTrimmed}</span>
                  &rdquo;
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
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

  // Theme toggle state (system / user stored)
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('rigamart_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('rigamart_theme', 'light');
    }
  };

  // Sync initial theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('rigamart_theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      setIsDark(true);
    } else if (savedTheme === 'light') {
      document.documentElement.removeAttribute('data-theme');
      setIsDark(false);
    }
  }, []);

  // Predictive search autocomplete & recent searches
  const [recentSearches, setRecentSearches] = useState(loadRecentSearches);
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const mobileInputRef = useRef(null);
  const notificationRef = useRef(null);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartTotalCount = useSelector((state) => state.cart.totalCount);
  const wishlistCount = useSelector((state) => state.wishlist?.items?.length ?? 0);
  const unreadCount = useSelector((state) => state.notification?.unreadCount ?? 0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleMobileSearchFocus = () => {
    if (mobileInputRef.current) {
      mobileInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 200);
    } else {
      navigate('/search');
    }
  };

  // Save recent search term to localStorage
  const saveRecentSearch = (term) => {
    if (!term || typeof term !== 'string' || !term.trim()) return;
    const clean = term.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 6);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save recent search to localStorage:', err);
      }
      return updated;
    });
  };

  const handleRemoveRecentSearch = (e, termToRemove) => {
    if (e) e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== termToRemove);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  const handleClearRecentSearches = (e) => {
    if (e) e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (err) {}
  };

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

  // Global Ctrl+K / Cmd+K Spotlight Search shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const inputEl = searchRef.current?.querySelector('input');
        inputEl?.focus();
        setShowDropdown(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

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
    const queryTrimmed = searchQuery.trim();

    if (queryTrimmed.length < 2) {
      recentSearches.forEach((term) => {
        items.push({ type: 'recent', term });
      });
      CURATED_CATEGORIES.slice(1, 6).forEach((cat) => {
        const slug = cat.href.split('=').pop();
        items.push({ type: 'popular_category', slug, name: cat.name });
      });
    } else {
      (suggestions.categories || []).forEach((cat) => {
        items.push({ type: 'category', data: cat });
      });
      (suggestions.products || []).slice(0, 4).forEach((prod) => {
        items.push({ type: 'product', data: prod });
      });
      items.push({ type: 'view_all', query: queryTrimmed });
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
        if (item.type === 'recent') {
          handleSelectRecentSearch(item.term);
        } else if (item.type === 'popular_category') {
          handleSelectCategory(item.slug);
        } else if (item.type === 'category') {
          handleSelectCategory(item.data.slug, searchQuery.trim());
        } else if (item.type === 'product') {
          handleSelectProduct(item.data);
        } else if (item.type === 'view_all') {
          handleSearchSubmit();
        }
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions({ products: [], categories: [] });
    setSelectedIndex(-1);
  };

  const handleSelectRecentSearch = (term) => {
    setSearchQuery(term);
    saveRecentSearch(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setShowDropdown(false);
    setMobileMenuOpen(false);
  };

  const handleSelectCategory = (slug, term) => {
    if (term) {
      saveRecentSearch(term);
      navigate(`/search?category=${encodeURIComponent(slug)}&q=${encodeURIComponent(term)}`);
    } else {
      navigate(`/search?category=${encodeURIComponent(slug)}`);
    }
    setShowDropdown(false);
    setMobileMenuOpen(false);
  };

  const handleSelectProduct = (prod) => {
    const id = prod?._id || prod;
    if (prod?.name) {
      saveRecentSearch(prod.name);
    }
    navigate(`/products/${id}`);
    setShowDropdown(false);
    setMobileMenuOpen(false);
  };

  // RAF-throttled scroll listener with dual-threshold hysteresis
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          setIsScrolled((prev) => {
            if (!prev && currentScrollY > 25) return true;
            if (prev && currentScrollY < 10) return false;
            return prev;
          });

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
      saveRecentSearch(searchQuery.trim());
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
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          isScrolled
            ? 'bg-surface/90 backdrop-blur-xl border-b border-line shadow-card'
            : 'bg-surface border-b border-line'
        }`}
      >
        {/* Top Banner for Trust / Free Delivery (hidden on mobile for maximum vertical space, collapses smoothly on desktop) */}
        <div
          className={`hidden sm:block bg-brand text-white text-xs text-center font-medium tracking-wide transition-all duration-300 overflow-hidden ${
            isBannerCollapsed
              ? 'max-h-0 py-0 opacity-0 pointer-events-none'
              : 'max-h-10 py-1.5 px-4 opacity-100'
          }`}
        >
          <span className="opacity-90">
            Super Saver Delivery: Free shipping across India on orders above ₹500
          </span>
        </div>

        {/* Main Navbar Bar (Compact 52px on mobile) */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between gap-2.5 sm:gap-4 transition-all duration-200 ${
              isBannerCollapsed ? 'h-13 sm:h-14' : 'h-13 sm:h-16'
            }`}
          >
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center group" aria-label="Rigamart Homepage">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className={`transition-transform duration-200 origin-left ${
                  isBannerCollapsed ? 'scale-95' : 'scale-100'
                }`}
              >
                <Logo variant="full" size="responsive" />
              </motion.div>
            </Link>
          </div>

          {/* Desktop Spotlight Search Bar */}
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
              placeholder="Search products, authentic brands, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              className={`w-full bg-canvas hover:bg-surface focus:bg-surface rounded-xl pl-10 pr-24 border border-line focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all text-ink placeholder:text-muted/60 ${
                isBannerCollapsed ? 'py-1.5 text-xs' : 'py-2 text-sm'
              }`}
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-brand animate-spin absolute left-3.5 pointer-events-none" />
            ) : (
              <Search className="w-4 h-4 text-muted absolute left-3.5 pointer-events-none" />
            )}

            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-16 p-1 text-muted hover:text-ink rounded-full hover:bg-line/40 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Keyboard Shortcut Pill (⌘K) */}
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-muted bg-surface border border-line rounded absolute right-2 pointer-events-none">
              ⌘K
            </kbd>

            {/* Predictive Autocomplete Dropdown */}
            <SearchSuggestionsDropdown
              show={showDropdown}
              isSearching={isSearching}
              searchQuery={searchQuery}
              suggestions={suggestions}
              recentSearches={recentSearches}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              onSelectRecentSearch={handleSelectRecentSearch}
              onRemoveRecentSearch={handleRemoveRecentSearch}
              onClearRecentSearches={handleClearRecentSearches}
              onSelectCategory={handleSelectCategory}
              onSelectProduct={handleSelectProduct}
              onSubmitSearch={handleSearchSubmit}
            />
          </form>

          {/* User Actions & Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Quick Search Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={handleMobileSearchFocus}
              className="md:hidden p-2 text-muted hover:text-brand hover:bg-brand-soft/40 transition-colors rounded-xl flex items-center justify-center"
              title="Search"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" />
            </motion.button>

            {/* Theme Toggle (Sun / Moon) */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 text-muted hover:text-ink hover:bg-canvas rounded-xl transition-colors flex items-center justify-center border border-transparent hover:border-line"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-accent transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
              )}
            </motion.button>

            {/* Wishlist Icon */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}>
              <Link
                to="/wishlist"
                className="relative p-2 text-muted hover:text-brand hover:bg-brand-soft/40 transition-colors rounded-xl flex items-center justify-center"
                title="Wishlist"
              >
                <Heart className="w-5 h-5 transition-transform duration-150" />
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span
                      key={wishlistCount}
                      variants={badgePulse}
                      initial="initial"
                      animate="animate"
                      exit={{ scale: 0 }}
                      className="absolute top-1 right-1 bg-accent text-ink text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-subtle leading-none"
                    >
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>

            {/* Shopping Cart Icon with Live Badge */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}>
              <Link
                to="/cart"
                className="relative p-2 text-muted hover:text-brand hover:bg-brand-soft/40 transition-colors rounded-xl flex items-center justify-center"
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
                      className="absolute top-1 right-1 bg-brand text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-subtle leading-none"
                    >
                      {cartTotalCount > 99 ? '99+' : cartTotalCount}
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleToggleNotifications}
                  className={`relative p-2 text-muted hover:text-brand hover:bg-brand-soft/40 transition-colors rounded-xl flex items-center justify-center ${
                    notificationDropdownOpen ? 'bg-brand-soft/60 text-brand' : ''
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
                        className="absolute top-1 right-1 bg-accent text-ink text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-subtle leading-none"
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
                  className="flex items-center gap-2 py-1 px-2.5 rounded-xl border border-line hover:border-muted/40 bg-surface hover:bg-canvas transition-colors text-sm font-medium text-ink shadow-subtle"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-soft text-brand-dark font-bold text-xs flex items-center justify-center uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate tracking-tight">{user.name}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      variants={modalContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-elevation border border-line py-2 z-50 origin-top-right text-left"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-line">
                        <p className="text-xs text-muted">Signed in as</p>
                        <p className="text-sm font-bold text-ink truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-brand-soft text-brand-dark">
                          {user.role}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-canvas transition-colors"
                      >
                        <User className="w-4 h-4 text-brand" />
                        My Profile
                      </Link>

                      <Link
                        to="/my-orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-canvas transition-colors"
                      >
                        <Package className="w-4 h-4 text-muted" />
                        My Orders
                      </Link>

                      {(user.role === 'seller' || user.role === 'admin') && (
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-canvas transition-colors"
                        >
                          <Store className="w-4 h-4 text-brand" />
                          Seller Dashboard
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-canvas transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-success" />
                          Admin Portal
                        </Link>
                      )}

                      <div className="border-t border-line my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
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
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 text-xs font-semibold text-ink hover:text-brand transition-colors"
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-dark rounded-xl shadow-subtle transition-all inline-block"
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
              className="md:hidden p-2 text-muted hover:text-ink rounded-lg focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Curated Category Navigation Strip (Desktop) */}
        <div className="hidden md:flex items-center gap-6 overflow-x-auto py-2 border-t border-line/60 scrollbar-none text-xs">
          {CURATED_CATEGORIES.map((cat) => {
            const isActive = location.pathname + location.search === cat.href;
            return (
              <Link
                key={cat.name}
                to={cat.href}
                className={`whitespace-nowrap transition-colors flex items-center gap-1.5 font-medium py-0.5 tracking-tight ${
                  isActive
                    ? 'text-brand font-semibold border-b-2 border-brand pb-0'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <span>{cat.name}</span>
                {cat.badge && (
                  <span className="text-[10px] font-bold bg-accent/20 text-accent px-1.5 py-0.2 rounded-full leading-tight">
                    {cat.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile Slide-Down Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              variants={drawerSlideDown}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden border-t border-line py-3 px-2 space-y-2 bg-surface"
            >
              {isAuthenticated ? (
                <div className="space-y-1">
                  <div className="px-3 py-2 bg-canvas rounded-xl border border-line">
                    <div className="text-xs text-muted">Signed in as</div>
                    <div className="text-sm font-semibold text-ink">{user?.name || user?.email}</div>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-soft text-brand-dark">
                      {user?.role}
                    </span>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-canvas rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4 text-brand" />
                    My Profile
                  </Link>
                  <Link
                    to="/my-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-canvas rounded-lg transition-colors"
                  >
                    <Package className="w-4 h-4 text-muted" />
                    My Orders
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleToggleNotifications();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-ink hover:bg-canvas rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-accent" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-accent text-ink text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </button>
                  {(user?.role === 'seller' || user?.role === 'admin') && (
                    <Link
                      to="/seller/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-canvas rounded-lg transition-colors"
                    >
                      <Store className="w-4 h-4 text-brand" />
                      Seller Dashboard
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-canvas rounded-lg transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-success" />
                      Admin Portal
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
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
                      className="flex items-center justify-center px-4 py-2 text-xs font-semibold text-ink bg-canvas hover:bg-line/40 border border-line rounded-xl transition-colors text-center w-full"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.96 }}>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-dark rounded-xl transition-colors shadow-subtle text-center w-full"
                    >
                      Register
                    </Link>
                  </motion.div>
                </div>
              )}

              {/* Mobile Quick Category Links */}
              <div className="border-t border-line pt-2 space-y-1 text-xs text-muted">
                {CURATED_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.name}
                    to={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-1.5 hover:text-brand transition-colors rounded-lg"
                  >
                    <span>{cat.name}</span>
                    {cat.badge && (
                      <span className="text-[10px] font-bold bg-accent/20 text-accent px-1.5 py-0.2 rounded-full">
                        {cat.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>

    {/* Mobile Search Bar (In normal page flow below 52px sticky header: scrolls naturally like Myntra) */}
    <div
      ref={mobileSearchRef}
      className="md:hidden bg-surface border-b border-line/70 px-3.5 py-2 relative z-30 shadow-2xs"
    >
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex items-center"
        role="combobox"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
      >
        <input
          ref={mobileInputRef}
          type="text"
          placeholder="Search products, brands, or categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-canvas text-xs sm:text-sm rounded-xl pl-9 pr-14 py-2 border border-line focus:bg-surface focus:border-brand focus:outline-none transition-all text-ink placeholder:text-muted/60"
        />
        {isSearching ? (
          <Loader2 className="w-4 h-4 text-brand animate-spin absolute left-3 pointer-events-none" />
        ) : (
          <Search className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
        )}
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-8 p-1 text-muted hover:text-ink rounded-full transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.92 }}
          className="absolute right-1.5 p-1.5 text-muted hover:text-brand transition-colors rounded-lg flex items-center justify-center"
          aria-label="Submit search"
        >
          <Search className="w-4 h-4 text-brand" />
        </motion.button>

        {/* Mobile Predictive Dropdown */}
        <SearchSuggestionsDropdown
          show={showDropdown}
          isSearching={isSearching}
          searchQuery={searchQuery}
          suggestions={suggestions}
          recentSearches={recentSearches}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          onSelectRecentSearch={handleSelectRecentSearch}
          onRemoveRecentSearch={handleRemoveRecentSearch}
          onClearRecentSearches={handleClearRecentSearches}
          onSelectCategory={handleSelectCategory}
          onSelectProduct={handleSelectProduct}
          onSubmitSearch={handleSearchSubmit}
        />
      </form>
    </div>
  </>
  );
}
