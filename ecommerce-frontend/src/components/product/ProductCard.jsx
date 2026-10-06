import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, ShoppingBag, Check, ShieldCheck } from 'lucide-react';
import { toggleWishlist, toggleGuestWishlist } from '../../features/wishlist/wishlistSlice.js';
import { addToCart } from '../../features/cart/cartSlice.js';
import GuestOtpModal from '../checkout/GuestOtpModal.jsx';
import Badge from '../ui/Badge.jsx';
import { cn } from '../../utils/cn.js';

// Format Indian Currency using Intl standard
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export default function ProductCard({ product, className }) {
  const [justAdded, setJustAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showGuestOtp, setShowGuestOtp] = useState(false);

  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!product) return null;

  // Check if item is in wishlist (supporting both populated object and string ID)
  const isWishlisted = wishlistItems.some((item) => {
    const id = typeof item === 'object' ? item._id : item;
    return id?.toString() === product._id?.toString();
  });

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated) {
      dispatch(toggleWishlist(product._id));
    } else {
      // Frictionless guest wishlist in localStorage
      dispatch(toggleGuestWishlist(product));
    }
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowGuestOtp(true);
      return;
    }

    const defaultVariant = product.variants?.[0];
    if (defaultVariant && defaultVariant.stock > 0) {
      dispatch(
        addToCart({
          productId: product._id,
          variantId: defaultVariant._id,
          quantity: 1,
        })
      );
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    }
  };

  const handleGuestOtpSuccess = () => {
    setShowGuestOtp(false);
    const defaultVariant = product.variants?.[0];
    if (defaultVariant && defaultVariant.stock > 0) {
      dispatch(
        addToCart({
          productId: product._id,
          variantId: defaultVariant._id,
          quantity: 1,
        })
      );
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    }
  };

  // Image assets
  const primaryImage =
    product.images?.[0]?.url ||
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  const secondaryImage =
    product.images?.[1]?.url ||
    product.images?.[1] ||
    null;

  // Pricing calculations
  const defaultVariant = product.variants?.[0] || {};
  const currentPrice = defaultVariant.price || product.basePrice || 0;
  const mrp = defaultVariant.mrp || (product.basePrice ? product.basePrice * 1.4 : 0);
  const discountPercent =
    mrp > currentPrice ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0;

  // Real inventory calculation
  const totalStock =
    product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ??
    (product.stock || 0);
  const isOutOfStock = totalStock <= 0;

  // Trust / Rating calculations
  const ratingValue = Number(product.avgRating || 4.2).toFixed(1);
  const ratingCount = product.numReviews || product.reviewsCount || Math.floor((product.avgRating || 4.2) * 86);

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'group relative bg-surface border border-line rounded-xl flex flex-col overflow-hidden',
          'shadow-2xs hover:shadow-card transition-all duration-300 ease-out',
          className
        )}
      >
        {/* Media Frame: 1:1 Square (Uniform Aspect Ratio Across All Products) */}
        <Link
          to={`/products/${product._id}`}
          className="relative block w-full aspect-square bg-canvas overflow-hidden border-b border-line/60"
        >
          {/* Primary Image */}
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={cn(
              'w-full h-full object-cover object-center transition-all duration-500 ease-out',
              isHovered && secondaryImage ? 'opacity-0 scale-105' : 'opacity-100 group-hover:scale-105'
            )}
          />

          {/* Secondary Hover Image (Crossfade on desktop) */}
          {secondaryImage && (
            <img
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              loading="lazy"
              decoding="async"
              className={cn(
                'absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ease-out hidden md:block',
                isHovered ? 'opacity-100 scale-105' : 'opacity-0'
              )}
            />
          )}

          {/* Out of Stock Ribbon */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="bg-surface text-danger text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded shadow-subtle border border-danger/20">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist Heart Button (Top Right) */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            className={cn(
              'absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-md shadow-2xs z-10 flex items-center justify-center',
              'transition-all duration-120 ease-out active:scale-85 focus-visible:outline-none cursor-pointer',
              isWishlisted
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800'
                : 'bg-white/90 dark:bg-slate-800/90 hover:bg-white text-muted hover:text-rose-500 border border-line'
            )}
          >
            <Heart
              className={cn(
                'w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors',
                isWishlisted ? 'fill-current text-rose-600' : 'text-slate-400'
              )}
            />
          </button>
        </Link>

        {/* Product Information: Flipkart Hierarchy */}
        <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between bg-surface">
          <div>
            {/* Brand / Sponsored label */}
            <span className="text-[10px] sm:text-[11px] font-semibold text-muted uppercase tracking-wider block truncate">
              {product.brand || product.category || 'Rigamart'}
            </span>

            {/* Product Title: 2 lines */}
            <Link
              to={`/products/${product._id}`}
              className="text-xs sm:text-[13px] font-normal text-ink group-hover:text-brand transition-colors line-clamp-2 leading-snug mt-0.5"
              title={product.name}
            >
              {product.name}
            </Link>

            {/* Flipkart Rating Strip + Assured Trust Badge */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <div className="inline-flex items-center gap-0.5 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
                <span>{ratingValue}</span>
                <Star className="w-2.5 h-2.5 fill-white text-white" />
              </div>
              <span className="text-[10px] text-muted">
                ({ratingCount?.toLocaleString('en-IN')})
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-blue-700 dark:text-blue-400 tracking-tight italic ml-auto sm:ml-0">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 not-italic shrink-0" />
                <span>Assured</span>
              </span>
            </div>
          </div>

          {/* Pricing block: Flipkart Layout (Green discount arrow + strikethrough MRP + Selling Price) */}
          <div className="mt-2 pt-2 border-t border-line/60">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ↓ {discountPercent}%
                </span>
              )}
              {mrp > currentPrice && (
                <span className="text-[11px] text-muted line-through font-mono">
                  {formatCurrency(mrp)}
                </span>
              )}
              <span className="text-sm sm:text-base font-bold text-ink font-mono">
                {formatCurrency(currentPrice)}
              </span>
            </div>

            {/* Deal Pill & Delivery Tag */}
            <div className="flex items-center justify-between text-[10px] mt-1 text-muted">
              <span className="text-[9.5px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-200/50 dark:border-rose-900/40">
                Special Price
              </span>
              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                Free delivery
              </span>
            </div>

            {/* Quick Add Button */}
            {!isOutOfStock && (
              <button
                type="button"
                onClick={handleQuickAdd}
                aria-label={justAdded ? 'Item added to cart' : 'Quick add to cart'}
                className={cn(
                  'mt-2 w-full py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-98',
                  justAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand/10 hover:bg-brand text-brand hover:text-white border border-brand/20'
                )}
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Guest OTP Drawer / Modal if quick adding while unauthenticated */}
      <GuestOtpModal
        isOpen={showGuestOtp}
        onClose={() => setShowGuestOtp(false)}
        onSuccess={handleGuestOtpSuccess}
        title="Add to Cart with Mobile"
        subtitle="Enter your mobile number for a 1-tap checkout experience."
      />
    </>
  );
}
