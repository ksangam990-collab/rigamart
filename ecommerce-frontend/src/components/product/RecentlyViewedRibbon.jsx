import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Star,
  Eye,
  X,
  Flame,
  ArrowRight
} from 'lucide-react';
import {
  getRecentlyViewed,
  clearRecentlyViewed,
  removeRecentlyViewed
} from '../../utils/recentlyViewed.js';

export default function RecentlyViewedRibbon({
  currentProductId = null,
  title = 'Recently Viewed Products',
  subtitle = 'Pick up right where you left off'
}) {
  const [items, setItems] = useState([]);
  const scrollContainerRef = useRef(null);

  const loadItems = () => {
    const all = getRecentlyViewed();
    // Exclude current product if provided
    const filtered = currentProductId ? all.filter((p) => p._id !== currentProductId) : all;
    setItems(filtered);
  };

  useEffect(() => {
    loadItems();

    const handleUpdate = () => {
      loadItems();
    };

    window.addEventListener('recentlyViewedUpdated', handleUpdate);
    return () => window.removeEventListener('recentlyViewedUpdated', handleUpdate);
  }, [currentProductId]);

  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 300;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35 }}
      className="pt-6 border-t border-line space-y-4"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand" />
            {title}
          </h2>
          <p className="text-xs text-muted mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Clear History */}
          <button
            type="button"
            onClick={clearRecentlyViewed}
            className="text-xs font-semibold text-muted hover:text-danger transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-danger-soft"
            title="Clear recently viewed history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>

          {/* Left / Right Carousel Controls */}
          {items.length > 3 && (
            <div className="flex items-center gap-1 pl-2 border-l border-line">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="p-1.5 rounded-lg border border-line bg-surface hover:bg-canvas text-muted hover:text-ink shadow-2xs transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="p-1.5 rounded-lg border border-line bg-surface hover:bg-canvas text-muted hover:text-ink shadow-2xs transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Ribbon Slider */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <AnimatePresence>
          {items.map((item) => {
            const isOutOfStock = item.totalStock <= 0;
            const isLowStock = !isOutOfStock && item.totalStock <= 5;
            const discount =
              item.mrp > item.price
                ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
                : 0;

            return (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative flex-shrink-0 w-52 sm:w-56 bg-surface rounded-2xl border border-line hover:border-line-dark shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group snap-start"
              >
                {/* Remove single item button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeRecentlyViewed(item._id);
                  }}
                  className="absolute top-2 right-2 z-20 p-1 rounded-full bg-surface/80 hover:bg-surface text-muted hover:text-danger shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from history"
                  aria-label="Remove item"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Product Thumbnail */}
                <Link
                  to={`/products/${item._id}`}
                  className="relative block aspect-square bg-canvas overflow-hidden"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Discount Badge */}
                  {discount > 0 && (
                    <span className="absolute top-2.5 left-2.5 bg-success text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                      {discount}% OFF
                    </span>
                  )}

                  {/* Out of Stock Overlay */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-danger text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded shadow-xs">
                        Out of Stock
                      </span>
                    </div>
                  )}

                  {/* Low Stock Badge */}
                  {isLowStock && (
                    <span className="absolute bottom-2 left-2 bg-warning text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>Only {item.totalStock} left</span>
                    </span>
                  )}
                </Link>

                {/* Content */}
                <div className="p-3.5 flex flex-col flex-1 justify-between space-y-2">
                  <div className="space-y-1">
                    {item.category && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                        {item.category}
                      </span>
                    )}
                    <Link
                      to={`/products/${item._id}`}
                      className="block text-xs font-semibold text-ink hover:text-brand transition-colors line-clamp-2 leading-tight"
                      title={item.name}
                    >
                      {item.name}
                    </Link>
                  </div>

                  {/* Rating & Pricing */}
                  <div className="space-y-1.5 pt-1">
                    {item.avgRating > 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-muted">
                        <span className="inline-flex items-center gap-0.5 font-semibold text-success bg-success-soft px-1.5 py-0.5 rounded text-[10px]">
                          {item.avgRating.toFixed(1)}{' '}
                          <Star className="w-2.5 h-2.5 fill-current" />
                        </span>
                        <span className="text-[10px]">({item.numReviews})</span>
                      </div>
                    )}

                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-sm font-bold text-ink">
                        ₹{(item.price || 0).toLocaleString('en-IN')}
                      </span>
                      {item.mrp > item.price && (
                        <span className="text-[10px] text-muted line-through">
                          ₹{Math.round(item.mrp).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/products/${item._id}`}
                      className="w-full py-1.5 bg-canvas hover:bg-brand-soft border border-line hover:border-brand/30 text-ink hover:text-brand font-semibold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 mt-1"
                    >
                      <span>View Item</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
