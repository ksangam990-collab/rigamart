import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingCart,
  Zap,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Star,
  Loader2,
  ChevronRight,
  Store
} from 'lucide-react';
import api from '../utils/api.js';
import { addToCart } from '../features/cart/cartSlice.js';
import { toggleWishlist } from '../features/wishlist/wishlistSlice.js';
import VariantSelector from '../components/product/VariantSelector.jsx';
import ReviewSection from '../components/review/ReviewSection.jsx';
import RatingStars from '../components/common/RatingStars.jsx';

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
          // Select first in-stock variant if available, else first variant
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
        <p className="text-xs text-gray-500 font-medium">Loading product details...</p>
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
    setTimeout(() => setAddedToast(false), 2500);
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
          <div className="relative aspect-square bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded shadow">
                {discountPercent}% OFF
              </span>
            )}
            <button
              onClick={() => dispatch(toggleWishlist(product._id))}
              className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md shadow-md transition-all ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-white/80 hover:bg-white text-gray-500'
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`}
              />
            </button>
          </div>

          {/* Thumbnail Selector */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => {
                const url = img?.url || img;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(url)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === url
                        ? 'border-brand-600 ring-2 ring-brand-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={url} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                  </button>
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
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold disabled:opacity-40"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-sm font-bold text-gray-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= Math.min(stock, 10)}
                  onClick={() => setQuantity((q) => Math.min(Math.min(stock, 10), q + 1))}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold disabled:opacity-40"
                >
                  +
                </button>
              </div>
              <span className="text-[11px] text-gray-400">Max 10 units per order</span>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className="flex-1 py-3.5 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {addingToCart ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
              {isOutOfStock ? 'Currently Unavailable' : 'Add to Cart'}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="flex-1 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-5 h-5" />
              Buy Now
            </button>
          </div>

          {/* Added to Cart Success Toast */}
          {addedToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Item added to cart!
              </span>
              <Link to="/cart" className="underline hover:text-emerald-950 font-black">
                View Cart &rarr;
              </Link>
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-center">
            <div className="p-3 bg-gray-50 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-brand-600 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-gray-800">100% Authentic</div>
              <p className="text-[10px] text-gray-400">Verified Seller Stock</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <Truck className="w-5 h-5 text-brand-600 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-gray-800">Free Shipping</div>
              <p className="text-[10px] text-gray-400">On orders above ₹500</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <RotateCcw className="w-5 h-5 text-brand-600 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-gray-800">7-Day Return</div>
              <p className="text-[10px] text-gray-400">Doorstep pickup</p>
            </div>
          </div>

          {/* Seller Attribution Card */}
          {product.seller && (
            <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-indigo-600" />
                <div>
                  <span className="text-gray-400 text-[10px] block">Sold by</span>
                  <span className="font-bold text-gray-900">{product.seller.name || 'Verified Merchant'}</span>
                </div>
              </div>
              <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                Authorized Seller
              </span>
            </div>
          )}

          {/* Product Description */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Description</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Ratings Section */}
      <ReviewSection
        productId={product._id}
        initialRating={product.avgRating}
        initialNumReviews={product.numReviews}
      />
    </div>
  );
}
