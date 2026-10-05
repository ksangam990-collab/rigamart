import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { toggleWishlist, toggleGuestWishlist } from '../../features/wishlist/wishlistSlice.js';
import { addToCart } from '../../features/cart/cartSlice.js';
import GuestOtpModal from '../checkout/GuestOtpModal.jsx';
import Badge from '../ui/Badge.jsx';
import { cn } from '../../utils/cn.js';

// Format Indian Currency standard
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

  // Check if item is in wishlist
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
  const mrp = defaultVariant.mrp || (product.basePrice ? product.basePrice * 1.3 : 0);
  const discountPercent =
    mrp > currentPrice ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0;

  // Real inventory calculation
  const totalStock =
    product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ??
    (product.stock || 0);
  const isOutOfStock = totalStock <= 0;

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'group relative bg-surface flex flex-col overflow-hidden select-none',
          'transition-all duration-150 ease-out',
          className
        )}
      >
        {/* Media Frame: 4:5 Portrait Aspect Ratio (Page 8, 9: radius 0, no border) */}
        <Link
          to={`/products/${product._id}`}
          className="relative block w-full aspect-[4/5] bg-n-50 overflow-hidden"
        >
          {/* Primary Image */}
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={cn(
              'w-full h-full object-cover object-center transition-all duration-300 ease-out',
              isHovered && secondaryImage ? 'opacity-0 scale-[1.02]' : 'opacity-100 group-hover:scale-[1.02]'
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
                'absolute inset-0 w-full h-full object-cover object-center transition-all duration-300 ease-out hidden md:block',
                isHovered ? 'opacity-100 scale-[1.02]' : 'opacity-0'
              )}
            />
          )}

          {/* Badges Strip (Top Left, Page 10: Height 20, radius 2, max 1 badge per card) */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {discountPercent > 0 ? (
              <span className="bg-ink text-canvas text-[11px] font-semibold px-1.5 py-0.5 rounded-sm tabular-nums tracking-wider uppercase">
                {discountPercent}% OFF
              </span>
            ) : product.isFeatured ? (
              <Badge color="neutral" variant="solid" size="sm">
                Curated
              </Badge>
            ) : null}
          </div>

          {/* Out of Stock Scrim */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="bg-surface text-ink text-xs font-semibold tracking-wider uppercase px-2.5 py-1 rounded-sm border border-line">
                Out of Stock
              </span>
            </div>
          )}

          {/* Low Stock Warning (Honest Scarcity: real count <= 5) */}
          {!isOutOfStock && totalStock > 0 && totalStock <= 5 && (
            <div className="absolute bottom-2 left-2 z-10">
              <span className="bg-surface/95 text-warning text-[10px] font-medium px-1.5 py-0.5 rounded-sm border border-warning/30">
                Only {totalStock} left
              </span>
            </div>
          )}

          {/* Wishlist Heart Button (Page 8: 1.5px stroke, filled when wishlisted) */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            className={cn(
              'absolute top-2 right-2 p-2 rounded bg-surface/90 hover:bg-surface text-ink z-10',
              'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'
            )}
          >
            <Heart
              strokeWidth={1.5}
              className={cn(
                'w-4 h-4 transition-colors',
                isWishlisted ? 'fill-danger text-danger' : 'text-n-700'
              )}
            />
          </button>
        </Link>

        {/* Product Information (Page 10: seller/brand, title 2 lines max, price row) */}
        <div className="pt-3 pb-1 flex-1 flex flex-col justify-between bg-surface">
          <div>
            {/* Seller / Brand Line */}
            <div className="flex items-center justify-between text-xs text-muted mb-1">
              <span className="truncate">{product.brand || product.category || 'Rigamart'}</span>
              {product.avgRating > 0 && (
                <div className="flex items-center gap-1 text-ink font-medium tabular-nums">
                  <Star strokeWidth={1.5} className="w-3 h-3 fill-accent text-accent" />
                  <span>{product.avgRating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Product Title */}
            <Link
              to={`/products/${product._id}`}
              className="text-[14px] font-medium text-ink hover:underline transition-colors line-clamp-2 leading-snug tracking-tight"
              title={product.name}
            >
              {product.name}
            </Link>
          </div>

          {/* Price & Quick Add Row */}
          <div className="mt-2.5 pt-2.5 border-t border-line flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-[15px] font-semibold text-ink tracking-tight font-mono">
                  {formatCurrency(currentPrice)}
                </span>
                {mrp > currentPrice && (
                  <span className="text-xs text-muted line-through font-mono">
                    {formatCurrency(mrp)}
                  </span>
                )}
              </div>
              {product.variants?.length > 1 && (
                <span className="text-[11px] text-muted">
                  {product.variants.length} variants
                </span>
              )}
            </div>

            {/* Quick Add Button (Page 10: 44px hit area / 40px icon, radius 4) */}
            {!isOutOfStock && (
              <button
                type="button"
                onClick={handleQuickAdd}
                aria-label={justAdded ? 'Item added to cart' : 'Quick add to cart'}
                className={cn(
                  'h-8 px-2.5 rounded border flex items-center justify-center gap-1.5 transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand text-xs font-medium',
                  justAdded
                    ? 'border-success bg-success text-white'
                    : 'border-line hover:border-ink bg-surface text-ink hover:bg-n-50'
                )}
              >
                <AnimatePresence mode="wait">
                  {justAdded ? (
                    <motion.span
                      key="check"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-white font-medium"
                    >
                      <Check strokeWidth={2} className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="bag"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-ink"
                    >
                      <ShoppingBag strokeWidth={1.5} className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </motion.span>
                  )}
                </AnimatePresence>
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
