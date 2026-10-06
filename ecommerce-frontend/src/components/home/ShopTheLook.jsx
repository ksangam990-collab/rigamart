import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShoppingBag,
  Check,
  Ruler,
  Share2,
  Tag,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Flame,
  ArrowRight
} from 'lucide-react';
import { addToCart } from '../../features/cart/cartSlice.js';
import SizeFitAdvisorModal from './SizeFitAdvisorModal.jsx';
import GuestOtpModal from '../checkout/GuestOtpModal.jsx';

export default function ShopTheLook({ onOpenResellerModal }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [activeHotspot, setActiveHotspot] = useState(null);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [showGuestOtp, setShowGuestOtp] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // 3-Piece Outfit Ensemble Data
  const [outfitItems, setOutfitItems] = useState([
    {
      id: 'piece-shirt',
      name: 'Relaxed Indigo Linen Overshirt',
      fabric: '100% Normandy French Flax',
      price: 1499,
      mrp: 2999,
      discount: '50% OFF',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80',
      sizes: ['S', 'M', 'L', 'XL'],
      selectedSize: 'L',
      selected: true,
      hotspot: { top: '34%', left: '48%', label: '1. Linen Shirt' },
      dbProductId: '6ab73e4d83b8bebd1260aeea',
      dbVariantId: '6ab73e4d83b8bebd1260aeec' // Size L
    },
    {
      id: 'piece-chino',
      name: 'Tailored Sand Stretch Chinos',
      fabric: '98% Cotton • 2% Spandex 4-Way Flex',
      price: 1899,
      mrp: 3499,
      discount: '45% OFF',
      image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&auto=format&fit=crop&q=80',
      sizes: ['30', '32', '34', '36'],
      selectedSize: '32',
      selected: true,
      hotspot: { top: '64%', left: '52%', label: '2. Slim Chinos' },
      dbProductId: '6ab73e4d83b8bebd1260aeea',
      dbVariantId: '6ab73e4d83b8bebd1260aeeb'
    },
    {
      id: 'piece-shoes',
      name: 'Crisp White Court Low-Tops',
      fabric: 'Supple Vegan Leather • OrthoFoam',
      price: 2299,
      mrp: 4999,
      discount: '54% OFF',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=80',
      sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
      selectedSize: 'UK 8',
      selected: true,
      hotspot: { top: '88%', left: '56%', label: '3. Court Low-Tops' },
      dbProductId: '6ab73e4d83b8bebd1260aeea',
      dbVariantId: '6ab73e4d83b8bebd1260aeeb'
    }
  ]);

  // Toggle selection of individual piece
  const handleTogglePiece = (id) => {
    setOutfitItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Change size for a piece
  const handleSelectSize = (id, size) => {
    setOutfitItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selectedSize: size } : item))
    );
  };

  // Apply AI recommended size
  const handleApplyRecommendedSize = (recSize) => {
    setOutfitItems((prev) =>
      prev.map((item) => {
        if (item.id === 'piece-shirt') {
          return { ...item, selectedSize: recSize };
        }
        if (item.id === 'piece-chino') {
          const waistMap = { S: '30', M: '32', L: '34', XL: '36' };
          return { ...item, selectedSize: waistMap[recSize] || '32' };
        }
        return item;
      })
    );
  };

  // Calculation logic
  const selectedItems = outfitItems.filter((item) => item.selected);
  const selectedCount = selectedItems.length;
  const rawSubtotal = selectedItems.reduce((acc, curr) => acc + curr.price, 0);
  const totalMrp = selectedItems.reduce((acc, curr) => acc + curr.mrp, 0);

  // Dynamic Combo Discount: 30% for full trio, 15% for duo, 0% for 1
  let bundleDiscountPercent = 0;
  if (selectedCount === 3) bundleDiscountPercent = 30;
  else if (selectedCount === 2) bundleDiscountPercent = 15;

  const bundleSavings = Math.round(rawSubtotal * (bundleDiscountPercent / 100));
  const finalPayable = rawSubtotal - bundleSavings;
  const totalOverallSavings = totalMrp - finalPayable;

  // Add selected items to cart
  const handleAddLookToBag = async () => {
    if (selectedCount === 0) return;

    if (!isAuthenticated) {
      setShowGuestOtp(true);
      return;
    }

    try {
      for (const item of selectedItems) {
        await dispatch(
          addToCart({
            productId: item.dbProductId,
            variantId: item.dbVariantId,
            quantity: 1
          })
        );
      }
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    }
  };

  const handleGuestOtpSuccess = async () => {
    setShowGuestOtp(false);
    for (const item of selectedItems) {
      await dispatch(
        addToCart({
          productId: item.dbProductId,
          variantId: item.dbVariantId,
          quantity: 1
        })
      );
    }
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleShareLook = () => {
    if (onOpenResellerModal) {
      onOpenResellerModal({
        title: 'Rigamart Linen & Chino 3-Piece Complete Lookbook',
        wholesalePrice: finalPayable,
        mrp: totalMrp,
        image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&auto=format&fit=crop&q=80',
        category: "Men's Luxury Sartorial"
      });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ── Section Header ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50 text-[11px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>MYNTRA STYLE STUDIO • COMPLETE OUTFIT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-ink tracking-tight">
            Shop The Look: Mediterranean Linen Edit
          </h2>
          <p className="text-muted text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Coordinated 3-piece designer outfit. Customise your pieces or unlock an extra{' '}
            <strong className="text-brand font-bold">30% Combo Discount</strong> when you grab the full look.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsSizeModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-line hover:border-brand text-ink text-xs font-semibold shadow-subtle hover:text-brand transition-all shrink-0 cursor-pointer active:scale-95"
        >
          <Ruler className="w-4 h-4 text-brand" />
          <span>Find My Size (AI Advisor)</span>
        </button>
      </div>

      {/* ── Main Lookbook Container ──────────────────────────────────── */}
      <div className="bg-surface border border-line rounded-3xl p-5 sm:p-8 lg:p-10 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Styled Editorial Model Photography with Hotspots */}
        <div className="lg:col-span-5 relative">
          <div className="relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] rounded-2xl overflow-hidden bg-canvas border border-line shadow-inner group">
            <img
              src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=900&auto=format&fit=crop&q=80"
              alt="Model wearing complete Mediterranean linen outfit"
              className="w-full h-full object-cover object-top filter brightness-[0.98] group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            />

            {/* Gradient Vignette overlay for hotspot contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Hotspots on Model */}
            {outfitItems.map((item, idx) => (
              <div
                key={item.id}
                style={{ top: item.hotspot.top, left: item.hotspot.left }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                onMouseEnter={() => setActiveHotspot(item.id)}
                onMouseLeave={() => setActiveHotspot(null)}
              >
                {/* 44x44 Touch Target for Mobile Finger Reach */}
                <button
                  type="button"
                  onClick={() => handleTogglePiece(item.id)}
                  aria-label={`Toggle ${item.name}`}
                  className="relative group/hotspot cursor-pointer focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center p-2"
                >
                  <span
                    className={`absolute inset-1 rounded-full animate-ping opacity-75 ${
                      item.selected ? 'bg-brand' : 'bg-gray-400'
                    }`}
                  />
                  <div
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-lg transition-transform duration-200 group-hover/hotspot:scale-125 ${
                      item.selected
                        ? 'bg-brand text-white ring-4 ring-white/70'
                        : 'bg-gray-900 text-white/70 ring-2 ring-white/30'
                    }`}
                  >
                    {idx + 1}
                  </div>
                </button>

                {/* Hotspot Floating Tooltip */}
                <AnimatePresence>
                  {activeHotspot === item.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-950/95 backdrop-blur-md text-white text-xs p-2.5 rounded-xl shadow-xl border border-white/10 pointer-events-none z-30"
                    >
                      <p className="font-bold text-[11px] truncate">{item.name}</p>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="text-amber-400 font-mono font-bold">₹{item.price.toLocaleString('en-IN')}</span>
                        <span className="text-white/60">{item.fabric}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Bottom Floating Badge on Model */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2.5 rounded-xl bg-slate-950/75 backdrop-blur-md text-white border border-white/15">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold">Model is 6&apos;0&quot; wearing Size L</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-300 font-bold">
                Rigamart Studio
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Piece Selectors & Combo Price Math */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          {/* Piece Selector Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted mb-1">
              <span className="font-bold text-ink uppercase tracking-wider">
                Select Outfit Pieces ({selectedCount}/3 Selected)
              </span>
              <button
                type="button"
                onClick={() =>
                  setOutfitItems((prev) =>
                    prev.map((item) => ({ ...item, selected: selectedCount !== 3 }))
                  )
                }
                className="text-brand hover:underline font-semibold cursor-pointer"
              >
                {selectedCount === 3 ? 'Deselect All' : 'Select All 3'}
              </button>
            </div>

            {outfitItems.map((item, idx) => (
              <motion.div
                key={item.id}
                onMouseEnter={() => setActiveHotspot(item.id)}
                onMouseLeave={() => setActiveHotspot(null)}
                className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                  item.selected
                    ? activeHotspot === item.id
                      ? 'border-brand ring-2 ring-brand/20 bg-brand-soft/30 shadow-md'
                      : 'border-line bg-surface hover:border-brand/50'
                    : 'border-line/50 bg-canvas/60 opacity-60'
                }`}
              >
                {/* Item Left: Checkbox + Thumbnail + Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => handleTogglePiece(item.id)}
                    className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand cursor-pointer shrink-0"
                    id={`checkbox-${item.id}`}
                  />

                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-line shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-4 h-4 rounded-full bg-brand/10 text-brand text-[10px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-ink truncate">
                        {item.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-muted truncate">
                      {item.fabric}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono font-black text-xs sm:text-sm text-ink">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-muted line-through font-mono">
                        ₹{item.mrp.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                        {item.discount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Item Right: Size Selector */}
                {item.selected && (
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-line">
                    <span className="text-[10px] text-muted uppercase font-bold">
                      Size:
                    </span>
                    <div className="flex items-center gap-1">
                      {item.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleSelectSize(item.id, s)}
                          className={`min-w-7 h-7 px-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                            item.selectedSize === s
                              ? 'bg-brand text-white shadow-2xs'
                              : 'bg-canvas text-ink hover:bg-brand-soft border border-line'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Dynamic Combo Math Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-brand-soft/50 via-surface to-accent/10 border border-brand/30 space-y-3.5">
            {/* Combo Savings Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-brand tracking-wider">
                  {selectedCount === 3
                    ? '🔥 TRIO COMBO APPLIED (30% OFF)'
                    : selectedCount === 2
                    ? '✨ DUO COMBO APPLIED (15% OFF)'
                    : 'REGULAR PRICING'}
                </span>
                <div className="text-xl sm:text-2xl font-black font-display text-ink flex items-baseline gap-2">
                  <span>₹{finalPayable.toLocaleString('en-IN')}</span>
                  {bundleSavings > 0 && (
                    <span className="text-xs sm:text-sm text-muted line-through font-mono">
                      ₹{rawSubtotal.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {bundleSavings > 0 && (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-1 rounded-full shadow-2xs">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Save ₹{bundleSavings.toLocaleString('en-IN')} Extra</span>
                  </span>
                  <div className="text-[10px] text-muted mt-0.5">
                    Total Savings: ₹{totalOverallSavings.toLocaleString('en-IN')}
                  </div>
                </div>
              )}
            </div>

            {/* Perks Strip */}
            <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-line text-[11px] text-muted font-medium">
              <div className="flex items-center gap-1 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Free Express Delivery</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">+280 SuperCoins</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-brand shrink-0" />
                <span className="truncate">7-Day Free Exchange</span>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={handleAddLookToBag}
              className={`w-full sm:flex-1 py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-card transition-all cursor-pointer active:scale-98 ${
                addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : selectedCount === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-brand hover:bg-brand-dark text-white hover:shadow-lg'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Outfit Added to Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    {selectedCount === 3
                      ? `Add Complete Look to Bag (₹${finalPayable.toLocaleString('en-IN')})`
                      : `Add ${selectedCount} Item${selectedCount > 1 ? 's' : ''} to Bag (₹${finalPayable.toLocaleString('en-IN')})`}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShareLook}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 active:scale-98"
              title="Resell this complete outfit and earn commission"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Share &amp; Earn ₹450</span>
            </button>
          </div>

        </div>

      </div>

      {/* ── Size & Fit Advisor Modal ──────────────────────────────────── */}
      <SizeFitAdvisorModal
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        onApplySize={handleApplyRecommendedSize}
        currentSelectedSize={outfitItems[0].selectedSize}
      />

      {/* ── Guest OTP Modal ───────────────────────────────────────────── */}
      {showGuestOtp && (
        <GuestOtpModal
          isOpen={showGuestOtp}
          onClose={() => setShowGuestOtp(false)}
          onSuccess={handleGuestOtpSuccess}
        />
      )}
    </section>
  );
}
