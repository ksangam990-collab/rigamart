import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ShoppingCart,
  Check,
  Sparkles,
  ShieldCheck,
  Truck,
  ArrowRight,
  Package
} from 'lucide-react';
import { addToCart } from '../../features/cart/cartSlice.js';

export default function FrequentlyBoughtTogether({
  currentProduct,
  currentVariant,
  relatedProducts = []
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Prepare complementary candidate products (up to 2 related items)
  const complementaryCandidates = useMemo(() => {
    if (!currentProduct || !relatedProducts || relatedProducts.length === 0) {
      return [];
    }
    return relatedProducts
      .filter((p) => p._id !== currentProduct._id)
      .slice(0, 2);
  }, [currentProduct, relatedProducts]);

  // Construct structured bundle items list (Current Product + Complementary Items)
  const bundleItems = useMemo(() => {
    if (!currentProduct) return [];

    // Current product variant & pricing
    const mainVariant =
      currentVariant ||
      currentProduct.variants?.find((v) => (v.stock || 0) > 0) ||
      currentProduct.variants?.[0] ||
      null;

    const mainPrice = mainVariant?.price ?? currentProduct.basePrice ?? 0;
    const mainMrp = mainVariant?.mrp ?? Math.round(mainPrice * 1.3);
    const mainImage =
      mainVariant?.image ||
      currentProduct.images?.[0]?.url ||
      currentProduct.images?.[0] ||
      null;

    const items = [
      {
        _id: currentProduct._id,
        productId: currentProduct._id,
        name: currentProduct.name,
        price: mainPrice,
        mrp: mainMrp,
        image: mainImage,
        variant: mainVariant,
        isCurrent: true,
        stock: mainVariant?.stock ?? 10
      }
    ];

    // Add complementary products
    complementaryCandidates.forEach((cand) => {
      const candVariant =
        cand.variants?.find((v) => (v.stock || 0) > 0) ||
        cand.variants?.[0] ||
        null;
      const candPrice = candVariant?.price ?? cand.basePrice ?? 0;
      const candMrp = candVariant?.mrp ?? Math.round(candPrice * 1.3);
      const candImage =
        candVariant?.image ||
        cand.images?.[0]?.url ||
        cand.images?.[0] ||
        null;

      items.push({
        _id: cand._id,
        productId: cand._id,
        name: cand.name,
        price: candPrice,
        mrp: candMrp,
        image: candImage,
        variant: candVariant,
        isCurrent: false,
        stock: candVariant?.stock ?? 10
      });
    });

    return items;
  }, [currentProduct, currentVariant, complementaryCandidates]);

  // All bundle items selected by default
  const [selectedIds, setSelectedIds] = useState(() =>
    bundleItems.map((item) => item._id)
  );

  // Keep selectedIds updated if bundleItems changes (e.g. variant change)
  React.useEffect(() => {
    if (bundleItems.length > 0) {
      setSelectedIds(bundleItems.map((item) => item._id));
    }
  }, [bundleItems]);

  // Toggle item selection
  const toggleItem = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // If no complementary items available, hide this section
  if (complementaryCandidates.length === 0 || bundleItems.length < 2) {
    return null;
  }

  // Active items calculation
  const selectedItems = bundleItems.filter((item) => selectedIds.includes(item._id));
  const totalOriginalPrice = selectedItems.reduce((acc, item) => acc + item.price, 0);
  const totalMrp = selectedItems.reduce((acc, item) => acc + item.mrp, 0);

  // 10% Bundle Discount active when 2 or more items are selected
  const hasBundleDiscount = selectedItems.length >= 2;
  const bundleDiscountSavings = hasBundleDiscount
    ? Math.round(totalOriginalPrice * 0.1)
    : 0;
  const finalBundlePrice = totalOriginalPrice - bundleDiscountSavings;
  const totalCombinedSavings = totalMrp - finalBundlePrice;

  // Add all selected items to cart
  const handleAddBundleToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (selectedItems.length === 0) return;

    setIsAdding(true);
    setAddedSuccess(false);

    try {
      // Add each item in sequence
      for (const item of selectedItems) {
        if (item.variant?._id) {
          await dispatch(
            addToCart({
              productId: item.productId,
              variantId: item.variant._id,
              quantity: 1
            })
          ).unwrap();
        }
      }

      setAddedSuccess(true);
      setTimeout(() => {
        setAddedSuccess(false);
      }, 4000);
    } catch (err) {
      console.error('Failed to add bundle to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35 }}
      className="my-10 bg-surface border border-line rounded-none p-5 sm:p-7 overflow-hidden"
    >
      {/* Header with Smart Bundle Savings Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[11px] font-semibold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20">
              <Sparkles className="w-3 h-3 text-warning fill-warning" />
              Smart Bundle Offer
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-success/10 text-success border border-success/20">
              Extra 10% OFF
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-ink tracking-tight mt-1.5">
            Frequently Bought Together
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Select items to buy together and automatically unlock bundle discount savings.
          </p>
        </div>
      </div>

      {/* Main Bundle Area: Visual Addition Chain + Bundle Summary */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Addition Chain & Itemized Selection */}
        <div className="lg:col-span-8 space-y-6">
          {/* Visual Addition Chain */}
          <div className="flex flex-wrap items-center justify-start gap-3 sm:gap-4">
            {bundleItems.map((item, index) => {
              const isChecked = selectedIds.includes(item._id);

              return (
                <React.Fragment key={item._id}>
                  {index > 0 && (
                    <div className="w-8 h-8 rounded-full bg-canvas border border-line flex items-center justify-center text-ink font-bold shrink-0">
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  )}

                  <div
                    onClick={() => toggleItem(item._id)}
                    className={`group relative flex flex-col items-center p-3 rounded-none border transition-all cursor-pointer w-32 sm:w-40 select-none ${
                      isChecked
                        ? 'border-ink bg-surface ring-1 ring-ink'
                        : 'border-line bg-canvas opacity-60 grayscale-[30%] hover:grayscale-0'
                    }`}
                  >
                    {/* Checkbox indicator */}
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleItem(item._id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${item.name}`}
                        className="w-4 h-4 text-ink rounded-none border-line focus:ring-ink cursor-pointer"
                      />
                    </div>

                    {/* Tag badge for current product */}
                    {item.isCurrent && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider bg-ink text-canvas px-1.5 py-0.5 rounded-sm">
                        This Item
                      </span>
                    )}

                    {/* Product Image */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-none overflow-hidden bg-surface border border-line flex items-center justify-center p-1 mt-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-muted" />
                      )}
                    </div>

                    {/* Product Mini Info */}
                    <div className="mt-2.5 text-center w-full">
                      <p className="text-xs font-semibold text-ink line-clamp-2 leading-tight">
                        {item.name}
                      </p>
                      <div className="mt-1 flex items-baseline justify-center gap-1.5">
                        <span className="text-xs font-bold text-brand font-mono">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        {item.mrp > item.price && (
                          <span className="text-[10px] text-muted line-through font-mono">
                            ₹{item.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Itemized Selection Checkboxes List */}
          <div className="pt-4 border-t border-line space-y-2.5 text-xs">
            {bundleItems.map((item) => {
              const isChecked = selectedIds.includes(item._id);

              return (
                <label
                  key={item._id}
                  className="flex items-start gap-2.5 cursor-pointer select-none text-muted hover:text-ink group"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleItem(item._id)}
                    className="mt-0.5 w-4 h-4 text-brand rounded border-line focus:ring-brand accent-brand cursor-pointer"
                  />
                  <div className="leading-snug flex-1">
                    {item.isCurrent ? (
                      <strong className="text-brand font-bold">This item: </strong>
                    ) : null}
                    <Link
                      to={`/products/${item.productId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium hover:text-brand hover:underline transition-colors text-ink"
                    >
                      {item.name}
                    </Link>
                    <span className="ml-2 font-bold text-ink font-mono">
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                    {item.mrp > item.price && (
                      <span className="ml-1.5 text-muted line-through text-[11px] font-mono">
                        ₹{item.mrp.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Right Column: Bundle Pricing & 1-Click Buy Box */}
        <div className="lg:col-span-4 bg-surface border border-line rounded-none p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-ink">
                Bundle Price
              </span>
              <span className="font-medium text-muted">
                {selectedItems.length} of {bundleItems.length} selected
              </span>
            </div>

            {/* Price Display */}
            <div className="mt-3">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-bold text-ink tracking-tight font-mono">
                  ₹{finalBundlePrice.toLocaleString('en-IN')}
                </span>
                {hasBundleDiscount && (
                  <span className="text-sm font-semibold text-muted line-through font-mono">
                    ₹{totalOriginalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Discount Savings Pills */}
              {hasBundleDiscount ? (
                <div className="mt-2.5 space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-sm">
                    <Sparkles className="w-3.5 h-3.5 text-success fill-success/20" />
                    <span>Save ₹{bundleDiscountSavings.toLocaleString('en-IN')} with 10% Bundle Discount</span>
                  </div>
                  {totalCombinedSavings > bundleDiscountSavings && (
                    <p className="text-[11px] text-success font-medium">
                      Total savings: ₹{totalCombinedSavings.toLocaleString('en-IN')} off MRP!
                    </p>
                  )}
                </div>
              ) : selectedItems.length === 1 ? (
                <p className="mt-2 text-[11px] text-warning font-medium">
                  Select at least 2 items to activate the 10% bundle discount!
                </p>
              ) : (
                <p className="mt-2 text-[11px] text-muted font-medium">
                  Please select at least 1 item to proceed.
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <motion.button
              type="button"
              whileTap={{ scale: selectedItems.length > 0 && !isAdding ? 0.99 : 1 }}
              onClick={handleAddBundleToCart}
              disabled={selectedItems.length === 0 || isAdding}
              className={`w-full py-3 px-4 rounded font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                addedSuccess
                  ? 'bg-success text-white'
                  : selectedItems.length === 0
                  ? 'bg-canvas text-muted border border-line cursor-not-allowed'
                  : 'bg-ink hover:bg-ink/90 text-canvas'
              }`}
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 border-2 border-canvas border-t-transparent rounded-full animate-spin" />
                  <span>Adding Bundle to Cart...</span>
                </>
              ) : addedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Added {selectedItems.length} Items to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    Add {selectedItems.length === bundleItems.length ? 'All' : selectedItems.length} to Cart
                  </span>
                </>
              )}
            </motion.button>

            {/* Quick Benefits Guarantee */}
            <div className="pt-3 border-t border-line space-y-1.5 text-[11px] text-muted font-medium">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-brand shrink-0" />
                <span>Free delivery eligible on bundle orders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
                <span>7-Day Hassle-Free Returns on all items</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
