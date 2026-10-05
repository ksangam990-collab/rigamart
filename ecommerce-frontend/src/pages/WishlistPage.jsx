import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { fetchWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice.js';
import { addToCart } from '../features/cart/cartSlice.js';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton.jsx';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-5">
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center shadow-inner"
        >
          <Heart className="w-10 h-10 fill-rose-500" />
        </motion.div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Wishlist is Empty</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
          Save your favorite products to keep track of seasonal sales, price drops, and restocks!
        </p>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="pt-2">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Explore Catalog Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          My Wishlist ({items.length} items)
        </h1>
        <p className="text-xs text-gray-500 mt-1">Saved items reserved for quick checkout</p>
      </div>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square bg-gray-50 overflow-hidden group">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => dispatch(removeFromWishlist(product._id))}
                      className="absolute top-2.5 right-2.5 p-2 bg-white/85 hover:bg-white text-gray-400 hover:text-rose-600 rounded-full shadow-sm transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>

                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {product.brand || 'Rigamart'}
                    </span>
                    <Link
                      to={`/products/${product._id}`}
                      className="text-xs font-bold text-gray-900 hover:text-brand-600 line-clamp-1 block transition-colors"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-sm font-black text-gray-900">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      {mrp > price && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{Math.round(mrp).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleMoveToCart(product)}
                    disabled={!inStock}
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {inStock ? 'Move to Cart' : 'Out of Stock'}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
