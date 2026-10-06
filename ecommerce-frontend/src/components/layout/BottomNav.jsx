import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Heart, Package, User } from 'lucide-react';

// ─── Tab config ──────────────────────────────────────────────────────────────

const TABS = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: true },
  { to: '/my-orders', label: 'Orders', icon: Package },
  { to: '/login', label: 'Profile', icon: User, profileTab: true },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function BottomNav() {
  const location = useLocation();
  const wishlistCount = useSelector((state) => state.wishlist?.items?.length ?? 0);
  const { isAuthenticated } = useSelector((state) => state.auth);

  function isActive(tab) {
    if (tab.exact) return location.pathname === tab.to;
    if (tab.profileTab) {
      return (
        location.pathname === '/login' ||
        location.pathname === '/register' ||
        location.pathname.startsWith('/profile')
      );
    }
    return location.pathname.startsWith(tab.to);
  }

  // Resolve profile tab destination
  function getTo(tab) {
    if (tab.profileTab) return isAuthenticated ? '/profile' : '/login';
    return tab.to;
  }

  // Do not render BottomNav on product detail pages where the sticky buy bar operates
  if (location.pathname.startsWith('/products/')) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-surface border-t border-line shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-colors duration-150"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-stretch h-16">
        {TABS.map((tab) => {
          const active = isActive(tab);
          const Icon = tab.icon;
          const badgeCount = tab.badge ? wishlistCount : 0;

          return (
            <NavLink
              key={tab.label}
              to={getTo(tab)}
              className="relative flex-1 flex flex-col items-center justify-center gap-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
              aria-label={tab.label}
            >
              {/* Active indicator dot */}
              <AnimatePresence>
                {active && (
                  <motion.span
                    layoutId="bottomNavIndicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand rounded-full"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    aria-hidden="true"
                  />
                )}
              </AnimatePresence>

              {/* Icon + badge wrapper */}
              <div className="relative">
                <motion.div
                  animate={active ? { scale: 1.08 } : { scale: 1 }}
                  transition={{ duration: 0.18 }}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors duration-150 ${
                      active ? 'text-brand' : 'text-muted'
                    }`}
                    strokeWidth={active ? 2.4 : 1.8}
                  />
                </motion.div>

                {/* Wishlist badge */}
                <AnimatePresence>
                  {tab.badge && badgeCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-accent text-ink text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none shadow-subtle"
                      aria-label={`${badgeCount} items in wishlist`}
                    >
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-medium transition-colors duration-150 ${
                  active ? 'text-brand font-semibold' : 'text-muted'
                }`}
              >
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>

      {/* Safe area spacer for iOS notch */}
      <div className="h-safe-area-bottom" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  );
}
