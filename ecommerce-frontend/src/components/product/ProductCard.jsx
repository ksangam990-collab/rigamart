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
      // Seamless guest OTP modal instead of disruptive window.location.href = '/login'
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
    // After login, add the item to cart
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
          'group relative bg-surface border border-line rounded-card flex flex-col overflow-hidden',
          'shadow-subtle hover:shadow-card transition-all duration-300 ease-out',
          className
        )}
      >
        {/* Media Frame: 4:5 Portrait Aspect Ratio */}
        <Link
          to={`/products/${product._id}`}
          className="relative block w-full aspect-[4/5] bg-canvas overflow-hidden"
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

          {/* Floating Badges Strip (Top Left) */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {discountPercent > 0 && (
              <span className="bg-brand text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-subtle tabular-nums tracking-tight">
                {discountPercent}% OFF
              </span>
            )}
            {product.isFeatured && (
              <Badge color="accent" variant="solid" size="sm">
                Curated
              </Badge>
            )}
          </div>

          {/* Out of Stock Ribbon */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="bg-surface text-danger text-xs font-bold tracking-wider uppercase px-3 py-1 rounded shadow-subtle border border-danger/20">
                Out of Stock
              </span>
            </div>
          )}

          {/* Low Stock Warning (Honest Scarcity: real count <= 5) */}
          {!isOutOfStock && totalStock > 0 && totalStock <= 5 && (
            <div className="absolute bottom-2.5 left-2.5 z-10">
              <span className="bg-surface/90 backdrop-blur-sm text-warning text-[10px] font-semibold px-2 py-0.5 rounded border border-warning/30 shadow-subtle">
                Only {totalStock} left
              </span>
            </div>
          )}

          {/* Wishlist Heart Button (120ms spring feedback) */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            className={cn(
              'absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md shadow-subtle z-10',
              'transition-all duration-120 ease-out active:scale-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
              isWishlisted
                ? 'bg-brand-soft text-brand-dark'
                : 'bg-surface/85 hover:bg-surface text-muted hover:text-danger'
            )}
          >
            <Heart
              className={cn(
                'w-4 h-4 transition-colors',
                isWishlisted ? 'fill-current text-brand' : 'text-muted'
              )}
            />
          </button>
        </Link>

        {/* Product Information */}
        <div className="p-4 flex-1 flex flex-col justify-between bg-surface">
          <div>
            {/* Category / Brand metadata */}
            <div className="flex items-center justify-between text-[11px] font-medium text-muted uppercase tracking-wider mb-1">
              <span>{product.brand || product.category || 'Rigamart'}</span>
              {product.avgRating > 0 && (
                <div className="flex items-center gap-1 text-ink font-semibold tabular-nums normal-case">
                  <Star className="w-3 h-3 fill-accent text-accent" />
                  <span>{product.avgRating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Product Title */}
            <Link
              to={`/products/${product._id}`}
              className="text-sm font-semibold text-ink hover:text-brand transition-colors line-clamp-2 leading-snug tracking-tight font-sans"
              title={product.name}
            >
              {product.name}
            </Link>
          </div>

          {/* Price & Action Row */}
          <div className="mt-3 pt-3 border-t border-line flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5 tabular-nums">
                <span className="text-base font-bold text-ink tracking-tight">
                  {formatCurrency(currentPrice)}
                </span>
                {mrp > currentPrice && (
                  <span className="text-xs text-muted line-through">
                    {formatCurrency(mrp)}
                  </span>
                )}
              </div>
              {product.variants?.length > 1 && (
                <span className="text-[10px] text-muted tracking-tight">
                  {product.variants.length} options available
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Quick Add Button */}
              {!isOutOfStock && (
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  aria-label={justAdded ? 'Item added to cart' : 'Quick add to cart'}
                  className={cn(
                    'w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-subtle',
                    justAdded
                      ? 'bg-success text-white'
                      : 'bg-brand-soft text-brand-dark hover:bg-brand hover:text-white'
                  )}
                >
                  <AnimatePresence mode="wait">
                    {justAdded ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.12 }}
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="bag"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.8 }}
                        transition={{ duration: 0.12 }}
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              )}
            </div>
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
