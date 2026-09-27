import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, ShoppingCart, Check } from 'lucide-react';
import { toggleWishlist } from '../../features/wishlist/wishlistSlice.js';
import { addToCart } from '../../features/cart/cartSlice.js';
import { heartBounceVariants } from '../../utils/animations.js';

export default function ProductCard({ product }) {
  const [justAdded, setJustAdded] = useState(false);
  const [heartAnim, setHeartAnim] = useState('idle');

  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!product) return null;

  const isWishlisted = wishlistItems.some((item) => {
    const id = typeof item === 'object' ? item._id : item;
    return id?.toString() === product._id?.toString();
  });

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setHeartAnim('active');
    setTimeout(() => setHeartAnim('idle'), 350);
    dispatch(toggleWishlist(product._id));
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    const defaultVariant = product.variants?.[0];
    if (defaultVariant && defaultVariant.stock > 0) {
      dispatch(
        addToCart({
          productId: product._id,
          variantId: defaultVariant._id,
          quantity: 1
        })
      );
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    }
  };

  const primaryImage =
    product.images?.[0]?.url ||
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

  const defaultVariant = product.variants?.[0] || {};
  const currentPrice = defaultVariant.price || product.basePrice || 0;
  const mrp = defaultVariant.mrp || product.basePrice * 1.3;
  const discountPercent =
    mrp > currentPrice ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0;

  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
  const isOutOfStock = totalStock <= 0;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
      className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden"
    >
      {/* Product Image & Badges */}
      <Link to={`/products/${product._id}`} className="relative block aspect-square bg-gray-50 overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[11px] font-black px-2 py-0.5 rounded shadow-sm">
            {discountPercent}% OFF
          </span>
        )}

        {/* Out of Stock Ribbon */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-black tracking-wider uppercase px-3 py-1 rounded shadow">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist Button with Heart Bounce */}
        <motion.button
          onClick={handleWishlistToggle}
          variants={heartBounceVariants}
          animate={heartAnim}
          whileTap={{ scale: 0.85 }}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md shadow-md transition-colors ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/85 hover:bg-white text-gray-500 hover:text-rose-500'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : ''
            }`}
          />
        </motion.button>
      </Link>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand */}
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            {product.brand || 'Rigamart Verified'}
          </div>

          {/* Product Title */}
          <Link
            to={`/products/${product._id}`}
            className="text-sm font-semibold text-gray-800 hover:text-brand-600 transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>

          {/* Ratings Pill */}
          <div className="flex items-center gap-2 mt-2">
            <div className="inline-flex items-center gap-1 bg-emerald-700 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
              <span>{(product.avgRating || 0).toFixed(1)}</span>
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-xs text-gray-400">
              ({product.numReviews || 0} reviews)
            </span>
          </div>
        </div>

        {/* Price & Quick Add Button */}
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-gray-900">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {mrp > currentPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{Math.round(mrp).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {product.variants?.length > 1 && (
              <span className="text-[10px] text-gray-400">
                {product.variants.length} options available
              </span>
            )}
          </div>

          {!isOutOfStock && (
            <motion.button
              onClick={handleQuickAdd}
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.05 }}
              title={justAdded ? 'Added to Cart' : 'Quick Add to Cart'}
              className={`p-2 rounded-lg transition-colors shadow-sm flex items-center justify-center ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-50 hover:bg-brand-600 text-brand-600 hover:text-white'
              }`}
            >
              <AnimatePresence mode="wait">
                {justAdded ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="cart"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
