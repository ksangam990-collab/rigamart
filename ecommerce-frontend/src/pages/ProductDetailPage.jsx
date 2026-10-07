import React, { useState, useEffect, useRef } from 'react';
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
  Store,
  Ruler,
  AlertCircle,
  Share2
} from 'lucide-react';
import api from '../utils/api.js';
import { addToCart } from '../features/cart/cartSlice.js';
import { toggleWishlist, toggleGuestWishlist } from '../features/wishlist/wishlistSlice.js';
import VariantSelector from '../components/product/VariantSelector.jsx';
import ReviewSection from '../components/review/ReviewSection.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton.jsx';
import Breadcrumb from '../components/common/Breadcrumb.jsx';
import FrequentlyBoughtTogether from '../components/product/FrequentlyBoughtTogether.jsx';
import GuestOtpModal from '../components/checkout/GuestOtpModal.jsx';
import RecentlyViewedRibbon from '../components/product/RecentlyViewedRibbon.jsx';
import ProductAiAssistant from '../components/ai/ProductAiAssistant.jsx';
import SizeGuideModal from '../components/product/SizeGuideModal.jsx';
import PincodeDeliveryEstimator from '../components/product/PincodeDeliveryEstimator.jsx';
import { Button, Badge, Skeleton } from '../components/ui';
import { recordRecentlyViewed } from '../utils/recentlyViewed.js';
import { heartBounceVariants, staggerContainer, staggerItem } from '../utils/animations.js';

// Format Indian Currency standard
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

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
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isGuestOtpOpen, setIsGuestOtpOpen] = useState(false);
  const [otpActionType, setOtpActionType] = useState('buyNow');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  const mainCtaRef = useRef(null);

  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  // Monitor scroll position to show sticky mobile buy bar once scrolled past main CTA
  useEffect(() => {
    const handleScroll = () => {
      if (!mainCtaRef.current) return;
      const rect = mainCtaRef.current.getBoundingClientRect();
      setShowStickyBar(rect.bottom < 70);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [product]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        const p = res.data.data.product;
        setProduct(p);
        recordRecentlyViewed(p);
        if (p.variants && p.variants.length > 0) {
          const inStock = p.variants.find((v) => (v.stock || 0) > 0) || p.variants[0];
          setSelectedVariant(inStock);
        }
        if (p.images && p.images.length > 0) {
          setSelectedImage(p.images[0]?.url || p.images[0]);
        }
      } catch {
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // Fetch related products
  useEffect(() => {
    if (!product?.category) return;
    const catQuery =
      typeof product.category === 'object' && product.category !== null
        ? product.category.slug || product.category._id || product.category.name
        : product.category;
    if (!catQuery) return;

    const fetchRelated = async () => {
      setRelatedLoading(true);
      try {
        const res = await api.get(`/products?category=${encodeURIComponent(catQuery)}&limit=5`);
        const all = res.data.data?.products || [];
        setRelatedProducts(all.filter((p) => p._id !== product._id).slice(0, 4));
      } catch {
        setRelatedProducts([]);
      } finally {
        setRelatedLoading(false);
      }
    };
    fetchRelated();
  }, [product?._id, product?.category]);

  // Zoom on hover handler (desktop)
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse font-sans">
        <Skeleton variant="text" className="w-48 h-4" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-4">
            <Skeleton className="aspect-[4/5] rounded-card w-full" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-7 space-y-6">
            <Skeleton variant="text" className="w-24 h-4" />
            <Skeleton variant="text" className="w-3/4 h-8" />
            <Skeleton variant="text" className="w-40 h-5" />
            <Skeleton className="h-16 rounded-card w-full" />
            <Skeleton className="h-28 rounded-card w-full" />
            <Skeleton className="h-12 rounded-xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center px-4 font-sans">
        <h2 className="text-2xl font-black text-ink mb-2">Product Not Available</h2>
        <p className="text-xs text-muted mb-6 leading-relaxed">
          The requested product could not be located or has been deactivated by its seller.
        </p>
        <Link to="/catalog">
          <Button variant="primary" size="md">
            Return to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlistItems.some((item) => {
    const itemId = typeof item === 'object' ? item._id : item;
    return itemId?.toString() === product._id?.toString();
  });

  const handleWishlistToggle = () => {
    setHeartAnim('active');
    setTimeout(() => setHeartAnim('idle'), 350);

    if (isAuthenticated) {
      dispatch(toggleWishlist(product._id));
    } else {
      // Frictionless guest wishlist in localStorage
      dispatch(toggleGuestWishlist(product));
    }
  };

  const price = selectedVariant?.price || product.basePrice || 0;
  const mrp = selectedVariant?.mrp || (product.basePrice ? product.basePrice * 1.3 : 0);
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const stock = selectedVariant?.stock || 0;
  const isOutOfStock = stock <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setOtpActionType('addToCart');
      setIsGuestOtpOpen(true);
      return;
    }
    if (!selectedVariant || isOutOfStock) return;

    setAddingToCart(true);
    await dispatch(
      addToCart({
        productId: product._id,
        variantId: selectedVariant._id,
        quantity,
      })
    );
    setAddingToCart(false);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      setOtpActionType('buyNow');
      setIsGuestOtpOpen(true);
      return;
    }
    if (!selectedVariant || isOutOfStock) return;

    await dispatch(
      addToCart({
        productId: product._id,
        variantId: selectedVariant._id,
        quantity,
      })
    );
    navigate('/cart');
  };

  const handleGuestOtpSuccess = async () => {
    if (!selectedVariant || isOutOfStock) return;
    await dispatch(
      addToCart({
        productId: product._id,
        variantId: selectedVariant._id,
        quantity,
      })
    );
    if (otpActionType === 'buyNow') {
      navigate('/cart');
    } else {
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 3000);
    }
  };

  const isApparelOrShoes =
    product.category?.name?.toLowerCase().includes('fashion') ||
    product.category?.name?.toLowerCase().includes('clothing') ||
    product.category?.name?.toLowerCase().includes('footwear') ||
    product.category?.name?.toLowerCase().includes('shoes');

  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name || 'Catalog'
      : product.category || 'Catalog';

  const categorySlug =
    typeof product.category === 'object' && product.category !== null
      ? product.category.slug || product.category._id || ''
      : product.category || '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-12 font-sans">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          {
            label: categoryName,
            href: `/search?category=${encodeURIComponent(categorySlug || categoryName)}`,
          },
          { label: product.name },
        ]}
      />

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Interactive Media Studio (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative aspect-[4/5] bg-surface rounded-card border border-line overflow-hidden shadow-subtle group"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={selectedImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
                alt={product.name}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="eager"
              />
            </AnimatePresence>

            {/* Magnifier Zoom Lens (Desktop) */}
            <div
              className="absolute inset-0 pointer-events-none hidden md:block bg-no-repeat bg-cover transition-opacity duration-150"
              style={{
                ...zoomStyle,
                backgroundImage: `url(${selectedImage})`,
                backgroundSize: '220%',
              }}
            />

            {/* Discount Badge */}
            {discountPercent > 0 && (
              <span className="absolute top-3.5 left-3.5 bg-brand text-white text-xs font-bold px-2.5 py-0.5 rounded shadow-subtle tabular-nums tracking-tight">
                {discountPercent}% OFF
              </span>
            )}

            {/* Wishlist Button with Heart Feedback */}
            <motion.button
              type="button"
              onClick={handleWishlistToggle}
              variants={heartBounceVariants}
              animate={heartAnim}
              whileTap={{ scale: 0.85 }}
              aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className={`absolute top-3.5 right-3.5 p-2.5 rounded-full backdrop-blur-md shadow-subtle transition-colors z-10 ${
                isWishlisted
                  ? 'bg-brand-soft text-brand-dark'
                  : 'bg-surface/85 hover:bg-surface text-muted hover:text-danger'
              }`}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isWishlisted ? 'fill-current text-brand' : 'text-muted'
                }`}
              />
            </motion.button>
          </div>

          {/* Thumbnail Gallery Row */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img, i) => {
                const url = img?.url || img;
                const isSelected = selectedImage === url;
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => setSelectedImage(url)}
                    className={`relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all shadow-subtle ${
                      isSelected
                        ? 'border-brand ring-2 ring-brand/20'
                        : 'border-line hover:border-muted/50'
                    }`}
                  >
                    <img src={url} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Product Buy Box & Logistics (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted font-mono">
              <span>{product.brand || 'Rigamart Curated'}</span>
              {isApparelOrShoes && (
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-brand hover:text-brand-dark flex items-center gap-1 font-semibold normal-case tracking-normal hover:underline"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size &amp; Fit Guide</span>
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-display text-ink tracking-tight mt-1.5 leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Customer Reviews Summary */}
            <div className="flex items-center gap-3 mt-3">
              <div className="inline-flex items-center gap-1 bg-brand text-white text-xs font-bold px-2 py-0.5 rounded tabular-nums">
                <span>{(product.avgRating || 0).toFixed(1)}</span>
                <Star className="w-3 h-3 fill-accent text-accent" />
              </div>
              <span className="text-xs text-muted tabular-nums">
                ({product.numReviews || 0} Verified Customer Reviews)
              </span>
            </div>
          </div>

          {/* Pricing Surface */}
          <div className="p-4 bg-surface rounded-card border border-line flex items-baseline gap-3 tabular-nums shadow-subtle">
            <span className="text-3xl font-black text-ink tracking-tight">
              {formatCurrency(price)}
            </span>
            {mrp > price && (
              <span className="text-sm text-muted line-through">
                {formatCurrency(mrp)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded">
                Save {formatCurrency(Math.round(mrp) - price)} ({discountPercent}% off)
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

          {/* Truthful Inventory Status (Honest Persuasion) */}
          {isOutOfStock ? (
            <div className="p-3.5 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 text-danger">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Currently Unavailable</p>
                <p className="text-[11px] text-danger/80 mt-0.5">
                  This variant is out of stock. Please check another option or check back shortly.
                </p>
              </div>
            </div>
          ) : stock <= 5 ? (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl flex items-center gap-2.5 text-warning">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-xs font-semibold">
                Only {stock} {stock === 1 ? 'item' : 'items'} remaining in stock
              </span>
            </div>
          ) : (
            <div className="p-3 bg-brand-soft border border-brand/20 rounded-xl flex items-center gap-2.5 text-brand-dark">
              <Check className="w-4 h-4 text-brand shrink-0" />
              <span className="text-xs font-semibold">
                In Stock &amp; Verified for Express Courier Dispatch
              </span>
            </div>
          )}

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted font-mono">
                Quantity:
              </label>
              <div className="flex items-center border border-line rounded-lg overflow-hidden bg-surface shadow-subtle">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center bg-canvas hover:bg-line/40 text-ink font-bold disabled:opacity-30 transition-colors"
                  aria-label="Decrease quantity"
                >
                  &minus;
                </button>
                <span className="px-3 py-1 text-xs font-bold text-ink tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= Math.min(stock, 10)}
                  onClick={() => setQuantity((q) => Math.min(Math.min(stock, 10), q + 1))}
                  className="w-8 h-8 flex items-center justify-center bg-canvas hover:bg-line/40 text-ink font-bold disabled:opacity-30 transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <span className="text-[11px] text-muted">Max 10 per order</span>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div ref={mainCtaRef} className="flex flex-col sm:flex-row gap-3 pt-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleAddToCart}
              isLoading={addingToCart}
              disabled={isOutOfStock}
              className="flex-1"
              leftIcon={<ShoppingCart className="w-4 h-4" />}
            >
              {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="flex-1"
              leftIcon={<Zap className="w-4 h-4 text-accent" />}
            >
              Buy Now with 1-Tap
            </Button>
          </div>

          {/* Cart Added Notification Feedback */}
          <AnimatePresence>
            {addedToast && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="p-3.5 bg-brand-soft border border-brand/30 text-brand-dark text-xs font-bold rounded-xl flex items-center justify-between shadow-subtle"
              >
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand" />
                  Product added to your cart!
                </span>
                <Link to="/cart" className="underline text-brand hover:text-brand-dark font-black">
                  View Bag &rarr;
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Indian Postal Code Delivery Estimator */}
          <PincodeDeliveryEstimator />

          {/* Trust Guarantees Strip */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-line text-center">
            <div className="p-3 bg-surface rounded-xl border border-line space-y-1">
              <Truck className="w-4 h-4 text-brand mx-auto" />
              <div className="text-[11px] font-bold text-ink">Express Delivery</div>
              <div className="text-[10px] text-muted">24-48 hr dispatch</div>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-line space-y-1">
              <RotateCcw className="w-4 h-4 text-brand mx-auto" />
              <div className="text-[11px] font-bold text-ink">7-Day Returns</div>
              <div className="text-[10px] text-muted">Doorstep pickup</div>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-line space-y-1">
              <ShieldCheck className="w-4 h-4 text-brand mx-auto" />
              <div className="text-[11px] font-bold text-ink">Escrow Security</div>
              <div className="text-[10px] text-muted">Razorpay protected</div>
            </div>
          </div>

          {/* Verified Seller Card */}
          {product.seller && (
            <div className="p-4 bg-surface rounded-card border border-line flex items-center justify-between shadow-subtle">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-soft text-brand-dark rounded-xl">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-muted">Sold by</div>
                  <div className="text-sm font-bold text-ink">
                    {product.seller.storeName || product.seller.name || 'Verified Merchant'}
                  </div>
                </div>
              </div>
              <Badge color="brand" variant="subtle" size="sm" dot>
                Verified Seller
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Description & Specifications Section */}
      <div className="pt-8 border-t border-line grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-lg font-bold font-display text-ink tracking-tight">
            Product Specifications
          </h2>
          <div className="text-sm text-muted leading-relaxed whitespace-pre-line bg-surface p-6 rounded-card border border-line shadow-subtle">
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

      {/* Frequently Bought Together Engine */}
      <FrequentlyBoughtTogether
        currentProduct={product}
        currentVariant={selectedVariant}
        relatedProducts={relatedProducts}
      />

      {/* You Might Also Like Recommendation Grid */}
      {(relatedLoading || relatedProducts.length > 0) && (
        <section className="pt-8 border-t border-line">
          <div className="mb-6">
            <h2 className="text-xl font-bold font-display text-ink tracking-tight">
              You Might Also Like
            </h2>
            <p className="text-xs text-muted mt-1">
              Complementary selections from the same category
            </p>
          </div>

          {relatedLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer(0.05)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6"
            >
              {relatedProducts.map((p) => (
                <motion.div key={p._id} variants={staggerItem}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      )}

      {/* Recently Viewed Products Ribbon */}
      <RecentlyViewedRibbon currentProductId={product._id} />

      {/* Sticky Mobile Buy Now Bar */}
      <AnimatePresence>
        {showStickyBar && product && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/95 backdrop-blur-md border-t border-line px-4 py-2.5 shadow-elevation flex items-center justify-between gap-3"
            style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom, 10px))' }}
          >
            {/* Left: Thumbnail & Price */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <img
                src={selectedImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                alt={product.name}
                className="w-10 h-10 rounded-lg object-cover border border-line shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-ink truncate leading-tight">{product.name}</p>
                <div className="flex items-baseline gap-1.5 tabular-nums mt-0.5">
                  <span className="text-sm font-bold text-ink">{formatCurrency(price)}</span>
                  {mrp > price && (
                    <span className="text-[10px] text-muted line-through">{formatCurrency(mrp)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
              >
                {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guest Mobile OTP Checkout Modal */}
      <GuestOtpModal
        isOpen={isGuestOtpOpen}
        onClose={() => setIsGuestOtpOpen(false)}
        onSuccess={handleGuestOtpSuccess}
        title={otpActionType === 'buyNow' ? 'Instant Buy with Mobile' : 'Quick Sign In with Mobile'}
        subtitle="Verify with a 6-digit code sent to your phone to complete your order."
      />

      {/* Interactive Size Guide Sheet */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={categoryName}
      />

      {/* Rigamart Shopping Concierge */}
      <ProductAiAssistant
        product={product}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </div>
  );
}
