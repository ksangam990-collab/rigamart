import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { fetchWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice.js';
import { addToCart } from '../features/cart/cartSlice.js';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton.jsx';
import { Button } from '../components/ui/index.js';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state) => state.wishlist);

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

  if (isLoading && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-6 bg-line/60 rounded w-48 animate-pulse" />
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
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded bg-canvas border border-line text-muted mx-auto flex items-center justify-center">
          <Heart className="w-6 h-6 text-muted" />
        </div>
        <h2 className="text-xl font-bold text-ink tracking-tight">Your Wishlist is Empty</h2>
        <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
          Save your favorite products to keep track of seasonal sales, price drops, and restocks.
        </p>
        <div className="pt-2">
          <Link to="/search">
            <Button variant="primary" size="md">
              Explore Catalog Now
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-4 border-b border-line flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight flex items-center gap-2">
            <Heart className="w-5 h-5 text-accent fill-accent" />
            My Wishlist ({items.length})
          </h1>
          <p className="text-xs text-muted mt-0.5">Saved items reserved for quick checkout</p>
        </div>
      </div>

      <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {items.map((product) => {
            const defaultVariant = product.variants?.[0] || {};
            const price = defaultVariant.price || product.basePrice || 0;
            const mrp = defaultVariant.mrp || product.basePrice * 1.3;
            const imageUrl =
              product.images?.[0]?.url ||
              product.images?.[0] ||
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

            const inStock = product.variants?.some((v) => v.stock > 0);

            return (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                className="bg-surface rounded-none border border-line overflow-hidden hover:border-ink transition-colors duration-150 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[4/5] bg-canvas overflow-hidden group border-b border-line">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <button
                      onClick={() => dispatch(removeFromWishlist(product._id))}
                      className="absolute top-2 right-2 p-1.5 bg-surface/90 hover:bg-surface text-muted hover:text-danger rounded border border-line transition-colors"
                      title="Remove from wishlist"
                      aria-label="Remove item from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3.5 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted font-mono block">
                      {product.brand || 'Rigamart'}
                    </span>
                    <Link
                      to={`/products/${product._id}`}
                      className="text-xs font-bold text-ink hover:text-brand line-clamp-1 block transition-colors"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-baseline gap-2 pt-0.5">
                      <span className="text-sm font-bold text-ink font-mono tabular-nums">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      {mrp > price && (
                        <span className="text-xs text-muted line-through font-mono tabular-nums">
                          ₹{Math.round(mrp).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 pt-0">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={!inStock}
                    className="w-full py-2 bg-ink hover:bg-black text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{inStock ? 'Move to Cart' : 'Out of Stock'}</span>
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
