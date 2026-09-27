import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Zap,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Star,
  ChevronRight,
  Store
} from 'lucide-react';
import api from '../utils/api.js';
import { addToCart } from '../features/cart/cartSlice.js';
import { toggleWishlist } from '../features/wishlist/wishlistSlice.js';
import VariantSelector from '../components/product/VariantSelector.jsx';
import ReviewSection from '../components/review/ReviewSection.jsx';
import RatingStars from '../components/common/RatingStars.jsx';
import { heartBounceVariants } from '../utils/animations.js';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [heartAnim, setHeartAnim] = useState('idle');

  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        const p = res.data.data.product;
        setProduct(p);
        if (p.variants && p.variants.length > 0) {
          const inStock = p.variants.find((v) => (v.stock || 0) > 0) || p.variants[0];
          setSelectedVariant(inStock);
        }
        if (p.images && p.images.length > 0) {
          setSelectedImage(p.images[0]?.url || p.images[0]);
        }
      } catch (err) {
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
        <div className="h-4 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-square bg-gray-200 rounded-2xl w-full" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-7 space-y-6">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-5 bg-gray-200 rounded w-40" />
            <div className="h-16 bg-gray-200 rounded-2xl w-full" />
            <div className="h-24 bg-gray-200 rounded-xl w-full" />
            <div className="h-12 bg-gray-200 rounded-xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center px-4">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Product Not Available</h2>
        <p className="text-xs text-gray-500 mb-6">
          The requested product could not be located or has been deactivated by its seller.
        </p>
        <Link
          to="/search"
          className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-lg shadow-sm"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlistItems.some((item) => {
    const itemId = typeof item === 'object' ? item._id : item;
    return itemId?.toString() === product._id?.toString();
  });

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setHeartAnim('active');
    setTimeout(() => setHeartAnim('idle'), 350);
    dispatch(toggleWishlist(product._id));
  };

  const price = selectedVariant?.price || product.basePrice || 0;
  const mrp = selectedVariant?.mrp || product.basePrice * 1.3;
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const stock = selectedVariant?.stock || 0;
  const isOutOfStock = stock <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedVariant || isOutOfStock) return;

    setAddingToCart(true);
    await dispatch(
      addToCart({
        productId: product._id,
        variantId: selectedVariant._id,
        quantity
      })
    );
    setAddingToCart(false);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedVariant || isOutOfStock) return;

    await dispatch(
      addToCart({
        productId: product._id,
        variantId: selectedVariant._id,
        quantity
      })
    );
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/search" className="hover:text-brand-600">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-sm group">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={selectedImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
                alt={product.name}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.6 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out cursor-zoom-in"
              />
            </AnimatePresence>

            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded shadow">
                {discountPercent}% OFF
              </span>
            )}

            {/* Wishlist Button with Heart Bounce */}
            <motion.button
              onClick={handleWishlistToggle}
              variants={heartBounceVariants}
              animate={heartAnim}
              whileTap={{ scale: 0.85 }}
              aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md shadow-md transition-colors ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-white/80 hover:bg-white text-gray-500 hover:text-rose-500'
              }`}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`}
              />
            </motion.button>
          </div>

          {/* Thumbnail Selector */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => {
                const url = img?.url || img;
                const isSelected = selectedImage === url;
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImage(url)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      isSelected
                        ? 'border-brand-600 ring-2 ring-brand-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={url} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Buy Box (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-brand-600">
              {product.brand || 'Rigamart Exclusive'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1 leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Review summary */}
            <div className="flex items-center gap-3 mt-3">
              <div className="inline-flex items-center gap-1.5 bg-emerald-700 text-white text-xs font-bold px-2.5 py-0.5 rounded">
                <span>{(product.avgRating || 0).toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-xs text-gray-500">
                {product.numReviews || 0} Ratings & Customer Reviews
              </span>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-baseline gap-3">
            <span className="text-3xl font-black text-gray-900">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {mrp > price && (
              <span className="text-sm text-gray-400 line-through">
                MRP: ₹{Math.round(mrp).toLocaleString('en-IN')}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Save ₹{(Math.round(mrp) - price).toLocaleString('en-IN')} ({discountPercent}%)
              </span>
            )}
          </div>

          {/* Dynamic Variant Selector */}
          <VariantSelector
            variants={product.variants}
            selectedVariant={selectedVariant}
            onSelectVariant={(v) => {
              setSelectedVariant(v);
              setQuantity(1);
            }}
          />

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Quantity:
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-xs">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold disabled:opacity-40 transition-colors"
                >
                  -
                </motion.button>
                <span className="px-4 py-1.5 text-sm font-bold text-gray-800">
                  {quantity}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  disabled={quantity >= Math.min(stock, 10)}
                  onClick={() => setQuantity((q) => Math.min(Math.min(stock, 10), q + 1))}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold disabled:opacity-40 transition-colors"
                >
                  +
                </motion.button>
              </div>
              <span className="text-[11px] text-gray-400">Max 10 units per order</span>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className="flex-1 py-3.5 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {addingToCart ? (
                <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
              {isOutOfStock ? 'Currently Unavailable' : 'Add to Cart'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="flex-1 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-5 h-5 text-amber-300" />
              Buy Now
            </motion.button>
          </div>

          {/* Added to Cart Success Toast with AnimatePresence */}
          <AnimatePresence>
            {addedToast && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Item successfully added to your cart!
                </span>
                <Link to="/cart" className="underline hover:text-emerald-950 font-black text-brand-700">
                  View Cart &rarr;
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100 text-center">
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <Truck className="w-5 h-5 text-brand-600 mx-auto" />
              <div className="text-[11px] font-bold text-gray-800">Pan-India Delivery</div>
              <div className="text-[10px] text-gray-400">Dispatch in 24 hrs</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <RotateCcw className="w-5 h-5 text-brand-600 mx-auto" />
              <div className="text-[11px] font-bold text-gray-800">7-Day Returns</div>
              <div className="text-[10px] text-gray-400">Easy replacement</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <ShieldCheck className="w-5 h-5 text-brand-600 mx-auto" />
              <div className="text-[11px] font-bold text-gray-800">100% Verified</div>
              <div className="text-[10px] text-gray-400">Authentic seller</div>
            </div>
          </div>

          {/* Verified Seller Card */}
          {product.seller && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-100 text-brand-700 rounded-xl">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Sold by</div>
                  <div className="text-sm font-bold text-gray-900">
                    {product.seller.storeName || product.seller.name || 'Verified Merchant'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Verified Seller
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Description & Reviews Section */}
      <div className="pt-10 border-t border-gray-200 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Product Specifications</h2>
          <div className="prose prose-sm text-gray-600 leading-relaxed whitespace-pre-line bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            {product.description}
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <ReviewSection
            productId={product._id}
            reviews={product.reviews || []}
            avgRating={product.avgRating || 0}
            numReviews={product.numReviews || 0}
          />
        </div>
      </div>
    </div>
  );
}
