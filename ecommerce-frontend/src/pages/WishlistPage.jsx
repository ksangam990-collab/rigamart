import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Trash2, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { fetchWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice.js';
import { addToCart } from '../features/cart/cartSlice.js';

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
        <p className="text-xs text-gray-500 font-medium">Loading your wishlist...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Wishlist is Empty</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Save your favorite products to keep track of seasonal sales and restocks!
        </p>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          Explore Catalog Now
          <ArrowRight className="w-4 h-4" />
        </Link>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
            <div
              key={product._id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => dispatch(removeFromWishlist(product._id))}
                    className="absolute top-2.5 right-2.5 p-2 bg-white/80 hover:bg-white text-gray-400 hover:text-rose-600 rounded-full shadow-sm transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {product.brand || 'Rigamart'}
                  </span>
                  <Link
                    to={`/products/${product._id}`}
                    className="text-sm font-bold text-gray-900 hover:text-brand-600 line-clamp-2 leading-snug block"
                  >
                    {product.name}
                  </Link>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-base font-black text-gray-900">
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
                <button
                  onClick={() => handleMoveToCart(product)}
                  disabled={!inStock}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 text-white disabled:text-gray-400 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {inStock ? 'Move to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
