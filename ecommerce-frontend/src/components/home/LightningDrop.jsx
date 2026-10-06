import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, ShieldCheck, Check, Flame } from 'lucide-react';
import { addToCart } from '../../features/cart/cartSlice.js';
import GuestOtpModal from '../checkout/GuestOtpModal.jsx';

export default function LightningDrop({ product: customProduct }) {
  const [timeLeft, setTimeLeft] = useState(11922); // ~3h 18m
  const [justAdded, setJustAdded] = useState(false);
  const [showGuestOtp, setShowGuestOtp] = useState(false);

  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Fallback lightning deal item
  const deal = customProduct || {
    _id: 'aura-studio-anc-lightning',
    name: 'Aura Studio ANC Wireless Headphones',
    price: 2399,
    mrp: 5999,
    discountPercentage: 60,
    savings: 3600,
    claimPercent: 86,
    stockLeft: 6,
    category: 'Rigamart Exclusive Audio',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    variants: [{ _id: 'v-black', stock: 6, title: 'Matte Obsidian' }]
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 14400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}h ${m}m ${s}s`;
  };

  const handleGrabDeal = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setShowGuestOtp(true);
      return;
    }

    const variantId = deal.variants?.[0]?._id;
    dispatch(
      addToCart({
        productId: deal._id,
        variantId: variantId,
        quantity: 1
      })
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleGuestOtpSuccess = () => {
    setShowGuestOtp(false);
    const variantId = deal.variants?.[0]?._id;
    dispatch(
      addToCart({
        productId: deal._id,
        variantId: variantId,
        quantity: 1
      })
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <>
      <div className="w-full bg-surface border border-line rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-card relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header: Scarcity Pill + Countdown Timer */}
        <div className="flex items-center justify-between pb-2.5 border-b border-line mb-3 gap-2">
          <div className="flex items-center gap-1.5 shrink-0 min-w-0">
            <span className="relative flex items-center justify-center shrink-0">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-rose-500/40"></span>
              <Flame className="relative w-3.5 h-3.5 fill-rose-500 text-rose-600 shrink-0" />
            </span>
            <span className="text-[11px] sm:text-xs font-black uppercase text-rose-600 tracking-wider whitespace-nowrap">
              DEAL OF THE DAY
            </span>
          </div>

          <div className="font-mono tabular-nums font-bold text-[10.5px] sm:text-xs bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800 shadow-2xs flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <Clock className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{formatTimer(timeLeft)}</span>
          </div>
        </div>

        {/* ── MOBILE VIEW: High-Density Side-by-Side (Amazon/Flipkart Compact Style) ── */}
        <div className="sm:hidden space-y-3">
          <div className="flex items-stretch gap-3">
            {/* Left Thumbnail (Centered headphone image) */}
            <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-canvas border border-line flex items-center justify-center">
              <img
                src={deal.image}
                alt={deal.name}
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
              <div className="absolute top-1.5 left-1.5 bg-rose-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow-xs">
                {deal.discountPercentage}% OFF
              </div>
              <div className="absolute bottom-1.5 left-1.5 bg-slate-950/80 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full border border-white/10">
                4.9 ⭐
              </div>
            </div>

            {/* Right Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-brand block truncate">
                  {deal.category}
                </span>
                <h3 className="text-xs font-bold text-ink leading-snug line-clamp-2 mt-0.5">
                  {deal.name}
                </h3>
                <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                  <span className="text-base font-black text-ink font-mono tabular-nums">
                    ₹{deal.price?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-muted line-through font-mono tabular-nums">
                    ₹{deal.mrp?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 rounded">
                    Save ₹{deal.savings?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Claim Progress Mini Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-rose-600 flex items-center gap-0.5">
                    🔥 {deal.claimPercent}% Claimed
                  </span>
                  <span className="text-muted font-medium">
                    Only {deal.stockLeft} left
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${deal.claimPercent}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-600 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Primary Mobile CTA Button */}
          <button
            type="button"
            onClick={handleGrabDeal}
            className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-subtle active:scale-98 cursor-pointer ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-brand hover:bg-brand-dark text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Added to Shopping Bag!</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Grab Lightning Deal Now</span>
              </>
            )}
          </button>
        </div>

        {/* ── DESKTOP VIEW: Full Visual Card ── */}
        <div className="hidden sm:block space-y-3.5">
          {/* Product Visual Showcase */}
          <div className="relative group">
            <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative max-h-[170px]">
              <img
                src={deal.image}
                alt={deal.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="eager"
              />
              <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                {deal.discountPercentage}% OFF
              </div>
              <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                4.9 ⭐ (840+ Reviews)
              </div>
            </div>

            <div className="mt-2.5 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand block">
                {deal.category}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-ink leading-snug line-clamp-1">
                {deal.name}
              </h3>
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-lg sm:text-xl font-black text-ink font-mono tabular-nums">
                  ₹{deal.price?.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-muted line-through font-mono tabular-nums">
                  ₹{deal.mrp?.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                  Save ₹{deal.savings?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Claim Progress Bar with Shimmer */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-600 text-[11px] flex items-center gap-1">
                🔥 {deal.claimPercent}% Claimed
              </span>
              <span className="text-muted text-[11px] font-medium">
                Only {deal.stockLeft} units left!
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${deal.claimPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 rounded-full relative"
              />
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleGrabDeal}
              className={`w-full py-2.5 sm:py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-card active:scale-98 cursor-pointer ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand hover:bg-brand-dark text-white'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Added to Shopping Bag!</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Grab Lightning Deal Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Delivery Note */}
        <div className="mt-3 pt-2 border-t border-line text-[10px] text-muted flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-brand" />
            <span>Verified Brand Stock</span>
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            Dispatches in 4 hours
          </span>
        </div>
      </div>

      {/* Guest OTP Drawer */}
      {showGuestOtp && (
        <GuestOtpModal
          isOpen={showGuestOtp}
          onClose={() => setShowGuestOtp(false)}
          onSuccess={handleGuestOtpSuccess}
        />
      )}
    </>
  );
}
