import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, Check, Star, ShieldCheck } from 'lucide-react';
import { fetchWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice.js';
import { addToCart } from '../features/cart/cartSlice.js';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton.jsx';
import { Button } from '../components/ui/index.js';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state) => state.wishlist);
  const [movingAll, setMovingAll] = useState(false);
  const [movedSuccess, setMovedSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleMoveToCart = async (product) => {
    const defaultVariant = product.variants?.[0];
    if (defaultVariant && defaultVariant.stock > 0) {
      await dispatch(
        addToCart({
          productId: product._id,
          variantId: defaultVariant._id,
          quantity: 1
        })
      );
      dispatch(removeFromWishlist(product._id));
    }
  };

  const handleMoveAllToCart = async () => {
    const availableItems = items.filter((p) => p.variants?.some((v) => v.stock > 0));
    if (availableItems.length === 0) return;

    setMovingAll(true);
    for (const product of availableItems) {
      const defaultVariant = product.variants?.find((v) => v.stock > 0) || product.variants?.[0];
      if (defaultVariant) {
        await dispatch(
          addToCart({
            productId: product._id,
            variantId: defaultVariant._id,
            quantity: 1
          })
        );
        dispatch(removeFromWishlist(product._id));
      }
    }
    setMovingAll(false);
    setMovedSuccess(true);
    setTimeout(() => setMovedSuccess(false), 3000);
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="h-6 bg-line/60 rounded-lg w-48 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center border border-rose-500/20 shadow-subtle"
        >
          <Heart className="w-10 h-10 fill-rose-500 text-rose-500" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-black font-display text-ink tracking-tight">Your Wishlist is Empty</h2>
          <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed mt-1.5">
            Save your favorite styles, gadgets, and daily essentials to keep track of seasonal sales, price drops, and restocks!
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white font-bold text-xs rounded-xl shadow-subtle active:scale-98 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Explore Trending Catalog
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const inStockCount = items.filter((p) => p.variants?.some((v) => v.stock > 0)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 font-sans">
      {/* Header bar with Move-all-to-bag action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display text-ink tracking-tight flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500 shrink-0" />
            <span>My Wishlist</span>
            <span className="text-xs font-bold text-muted bg-surface px-2.5 py-0.5 rounded-full border border-line">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </h1>
          <p className="text-xs text-muted mt-1">Saved items reserved for instant checkout</p>
        </div>

        {inStockCount > 0 && (
          <Button
            variant="primary"
            size="md"
            disabled={movingAll}
            onClick={handleMoveAllToCart}
            leftIcon={movedSuccess ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          >
            {movingAll ? 'Moving Items...' : movedSuccess ? 'Moved to Bag!' : `Move All to Bag (${inStockCount})`}
          </Button>
        )}
      </div>

      {/* Responsive Wishlist Grid: 2 cols on mobile, 4 cols on desktop */}
      <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {items.map((product) => {
            const defaultVariant = product.variants?.[0] || {};
            const price = defaultVariant.price || product.basePrice || 0;
            const mrp = defaultVariant.mrp || Math.round(price * 1.35);
            const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
            const imageUrl =
              product.images?.[0]?.url ||
              product.images?.[0] ||
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

            const inStock = product.variants?.some((v) => v.stock > 0);
            const ratingAvg = product.ratings?.average || 4.7;

            return (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-surface rounded-2xl border border-line overflow-hidden shadow-2xs hover:shadow-card transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Product Image Box */}
                  <div className="relative aspect-square bg-canvas overflow-hidden">
                    <Link to={`/products/${product._id}`}>
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                    </Link>

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-rose-600 text-white font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded shadow-xs">
                        {discount}% OFF
                      </span>
                    )}

                    {/* Remove Trash Button */}
                    <button
                      type="button"
                      onClick={() => dispatch(removeFromWishlist(product._id))}
                      className="absolute top-2 right-2 p-1.5 sm:p-2 bg-surface/90 hover:bg-surface text-muted hover:text-rose-600 rounded-full shadow-2xs transition-colors border border-line"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Rating Pill */}
                    <div className="absolute bottom-2 left-2 bg-slate-950/75 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                      <span>{ratingAvg}</span>
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-3 sm:p-4 space-y-1.5">
                    <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-muted block truncate">
                      {product.brand || 'Rigamart'}
                    </span>
                    <Link
                      to={`/products/${product._id}`}
                      className="text-xs sm:text-sm font-bold text-ink hover:text-brand line-clamp-1 block transition-colors leading-snug"
                    >
                      {product.name}
                    </Link>

                    {/* Price and Savings Row */}
                    <div className="flex items-baseline gap-1.5 pt-0.5 flex-wrap">
                      <span className="text-xs sm:text-base font-black text-ink font-mono tabular-nums">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      {mrp > price && (
                        <span className="text-[10px] sm:text-xs text-muted line-through font-mono tabular-nums">
                          ₹{mrp.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Stock Status Pill */}
                    <div className="pt-0.5">
                      {inStock ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          In Stock
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-500">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Move to Bag CTA */}
                <div className="p-3 sm:p-4 pt-0">
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(product)}
                    disabled={!inStock}
                    className="w-full py-2 sm:py-2.5 bg-brand hover:bg-brand-dark text-white font-bold text-xs rounded-xl shadow-subtle transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-98"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{inStock ? 'Move to Bag' : 'Out of Stock'}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
