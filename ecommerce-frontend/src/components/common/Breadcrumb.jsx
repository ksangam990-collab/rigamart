import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Reusable Breadcrumb Component
 *
 * Usage:
 *   <Breadcrumb items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Electronics', href: '/search?category=electronics' },
 *     { label: 'Product Name' }   // last item — no href, non-clickable
 *   ]} />
 *
 * Mobile behaviour: when there are 4+ items, middle items are hidden
 * and replaced with a '…' ellipsis, keeping only the first item and
 * the last 2 items visible on small screens.
 */
export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  /**
   * Decide which items to show on mobile.
   * If total ≤ 3 → show all.
   * If total ≥ 4 → show first + '…' + last 2 (4 slots total).
   */
  const buildMobileItems = (all) => {
    if (all.length <= 3) return all;
    return [
      all[0],
      { label: '…', ellipsis: true },
      ...all.slice(-2),
    ];
  };

  const mobileItems = buildMobileItems(items);

  const Separator = () => (
    <span className="text-gray-300 select-none" aria-hidden="true">›</span>
  );

  const getItemLabel = (item) => {
    if (!item) return '';
    if (typeof item.label === 'object' && item.label !== null) {
      return item.label.name || item.label.title || item.label.slug || '';
    }
    return item.label != null ? String(item.label) : '';
  };

  const renderItem = (item, idx, arr) => {
    const isLast = idx === arr.length - 1;
    const labelText = getItemLabel(item);

    if (item.ellipsis) {
      return (
        <React.Fragment key="ellipsis">
          <Separator />
          <span className="text-gray-400 text-xs">…</span>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={`${labelText}-${idx}`}>
        {idx > 0 && <Separator />}
        {isLast || !item.href ? (
          <span
            className={`text-xs truncate max-w-[160px] sm:max-w-xs ${
              isLast
                ? 'text-gray-800 font-semibold'
                : 'text-gray-500'
            }`}
            aria-current={isLast ? 'page' : undefined}
            title={labelText}
          >
            {labelText}
          </span>
        ) : (
          <Link
            to={item.href}
            className="text-xs text-gray-500 hover:text-brand-600 transition-colors truncate max-w-[120px] sm:max-w-xs"
            title={labelText}
          >
            {labelText}
          </Link>
        )}
      </React.Fragment>
    );
  };

  return (
    <motion.nav
      aria-label="Breadcrumb"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Desktop: show all items */}
      <ol className="hidden sm:flex items-center gap-1.5 flex-wrap">
        {items.map((item, idx) => renderItem(item, idx, items))}
      </ol>

      {/* Mobile: truncated items */}
      <ol className="flex sm:hidden items-center gap-1.5 flex-wrap">
        {mobileItems.map((item, idx) => renderItem(item, idx, mobileItems))}
      </ol>
    </motion.nav>
  );
}
