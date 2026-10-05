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
      className="my-10 bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs overflow-hidden"
    >
      {/* Header with Smart Bundle Savings Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/70">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
              Smart Bundle Offer
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              Extra 10% OFF
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-1.5">
            Frequently Bought Together
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
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
                    <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 font-extrabold shadow-2xs shrink-0">
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  )}

                  <div
                    onClick={() => toggleItem(item._id)}
                    className={`group relative flex flex-col items-center p-3 rounded-xl border-2 transition-all cursor-pointer w-32 sm:w-40 select-none ${
                      isChecked
                        ? 'border-brand-500 bg-brand-50/20 shadow-xs ring-2 ring-brand-100'
                        : 'border-gray-200 bg-gray-50/70 opacity-60 grayscale-[30%] hover:grayscale-0'
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
                        className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                      />
                    </div>

                    {/* Tag badge for current product */}
                    {item.isCurrent && (
                      <span className="absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider bg-brand-600 text-white px-1.5 py-0.5 rounded shadow-2xs">
                        This Item
                      </span>
                    )}

                    {/* Product Image */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-white border border-gray-100 flex items-center justify-center p-1 mt-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-300" />
                      )}
                    </div>

                    {/* Product Mini Info */}
                    <div className="mt-2.5 text-center w-full">
                      <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight">
                        {item.name}
                      </p>
                      <div className="mt-1 flex items-baseline justify-center gap-1.5">
                        <span className="text-xs font-black text-brand-700">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        {item.mrp > item.price && (
                          <span className="text-[10px] text-gray-400 line-through">
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
          <div className="pt-4 border-t border-gray-100 space-y-2.5 text-xs">
            {bundleItems.map((item) => {
              const isChecked = selectedIds.includes(item._id);

              return (
                <label
                  key={item._id}
                  className="flex items-start gap-2.5 cursor-pointer select-none text-gray-700 hover:text-gray-900 group"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleItem(item._id)}
                    className="mt-0.5 w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                  />
                  <div className="leading-snug flex-1">
                    {item.isCurrent ? (
                      <strong className="text-brand-900 font-bold">This item: </strong>
                    ) : null}
                    <Link
                      to={`/products/${item.productId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium hover:text-brand-600 hover:underline transition-colors"
                    >
                      {item.name}
                    </Link>
                    <span className="ml-2 font-black text-gray-900">
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                    {item.mrp > item.price && (
                      <span className="ml-1.5 text-gray-400 line-through text-[11px]">
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
        <div className="lg:col-span-4 bg-gradient-to-br from-amber-50/60 via-orange-50/30 to-brand-50/40 border border-amber-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-amber-900">
                Bundle Price
              </span>
              <span className="font-medium text-gray-500">
                {selectedItems.length} of {bundleItems.length} selected
              </span>
            </div>

            {/* Price Display */}
            <div className="mt-3">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  ₹{finalBundlePrice.toLocaleString('en-IN')}
                </span>
                {hasBundleDiscount && (
                  <span className="text-sm font-semibold text-gray-400 line-through">
                    ₹{totalOriginalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Discount Savings Pills */}
              {hasBundleDiscount ? (
                <div className="mt-2.5 space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-1 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
                    <span>Save ₹{bundleDiscountSavings.toLocaleString('en-IN')} with 10% Bundle Discount</span>
                  </div>
                  {totalCombinedSavings > bundleDiscountSavings && (
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Total savings: ₹{totalCombinedSavings.toLocaleString('en-IN')} off MRP!
                    </p>
                  )}
                </div>
              ) : selectedItems.length === 1 ? (
                <p className="mt-2 text-[11px] text-amber-800 font-medium">
                  Select at least 2 items to activate the 10% bundle discount!
                </p>
              ) : (
                <p className="mt-2 text-[11px] text-gray-500 font-medium">
                  Please select at least 1 item to proceed.
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <motion.button
              type="button"
              whileHover={{ scale: selectedItems.length > 0 && !isAdding ? 1.02 : 1 }}
              whileTap={{ scale: selectedItems.length > 0 && !isAdding ? 0.97 : 1 }}
              onClick={handleAddBundleToCart}
              disabled={selectedItems.length === 0 || isAdding}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                addedSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-200'
                  : selectedItems.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-200'
              }`}
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
            <div className="pt-2 border-t border-amber-200/50 space-y-1 text-[11px] text-gray-600 font-medium">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>Free delivery eligible on bundle orders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>7-Day Hassle-Free Returns on all items</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
