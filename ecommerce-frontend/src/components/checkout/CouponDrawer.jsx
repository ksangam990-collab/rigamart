import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  TrendingDown,
  Clock,
  Info,
  Loader2
} from 'lucide-react';
import api from '../../utils/api.js';
import { triggerConfetti } from '../../utils/confetti.js';

export default function CouponDrawer({
  isOpen,
  onClose,
  currentSubtotal = 0,
  appliedCoupon = null,
  onApplyCoupon,
  onRemoveCoupon,
  isApplying = false
}) {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [localSuccess, setLocalSuccess] = useState(null);

  // Fetch active promo codes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setLocalError(null);
      setLocalSuccess(null);
      api
        .get('/coupons/active')
        .then((res) => {
          if (res.data?.success && res.data.data?.coupons) {
            setCoupons(res.data.data.coupons);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const code = manualCode.trim().toUpperCase();
    if (!code) {
      setLocalError('Please enter a promo code');
      return;
    }
    await executeApply(code);
  };

  const executeApply = async (code) => {
    setLocalError(null);
    setLocalSuccess(null);
    try {
      if (onApplyCoupon) {
        const result = await onApplyCoupon(code);
        if (result && result.success === false) {
          setLocalError(result.message || 'Failed to apply coupon');
          return;
        }
      }
      triggerConfetti({
        particleCount: 100,
        origin: { x: 0.65, y: 0.5 }
      });
      setManualCode('');
      setLocalSuccess(`Coupon "${code}" applied successfully!`);
      setTimeout(() => setLocalSuccess(null), 4000);
    } catch (err) {
      setLocalError(
        err.response?.data?.message || err.message || 'Invalid or expired coupon'
      );
    }
  };

  const calculateSavings = (coupon) => {
    if (!currentSubtotal || currentSubtotal < coupon.minCartValue) return 0;
    if (coupon.discountType === 'percentage') {
      const calculated = Math.round((currentSubtotal * coupon.discountValue) / 100);
      return coupon.maxDiscount ? Math.min(calculated, coupon.maxDiscount) : calculated;
    }
    return coupon.discountValue;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-surface shadow-2xl flex flex-col relative"
            >
              {/* Drawer Header */}
              <div className="p-5 sm:p-6 border-b border-line bg-surface flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-ink tracking-tight flex items-center gap-2">
                      Coupons & Offers
                      {coupons.length > 0 && (
                        <span className="bg-brand/10 text-brand text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {coupons.length} AVAILABLE
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-muted">
                      Cart Subtotal:{' '}
                      <span className="font-semibold text-ink font-mono">
                        ₹{Number(currentSubtotal).toLocaleString('en-IN')}
                      </span>
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  className="p-2 text-muted hover:text-ink hover:bg-canvas rounded-xl transition-colors"
                  aria-label="Close coupon drawer"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Drawer Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-surface">
                {/* Manual Code Input Form */}
                <div className="bg-canvas p-3.5 rounded-2xl border border-line">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
                    Have a promo or gift code?
                  </label>
                  <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => {
                          setManualCode(e.target.value.toUpperCase());
                          if (localError) setLocalError(null);
                        }}
                        placeholder="ENTER COUPON CODE"
                        className="w-full pl-3.5 pr-8 py-2.5 bg-surface border border-line rounded-xl text-xs font-mono font-bold uppercase text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:font-sans placeholder:font-normal placeholder:text-muted/60 shadow-2xs"
                      />
                      {manualCode && (
                        <button
                          type="button"
                          onClick={() => setManualCode('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      type="submit"
                      disabled={isApplying || !manualCode.trim()}
                      className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0 shadow-xs"
                    >
                      {isApplying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </motion.button>
                  </form>
                </div>

                {/* Notifications */}
                {localError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-danger-soft border border-danger/20 rounded-xl text-xs text-danger flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                    <span>{localError}</span>
                  </motion.div>
                )}

                {localSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-success-soft border border-success/20 rounded-xl text-xs text-success flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span className="font-semibold">{localSuccess}</span>
                  </motion.div>
                )}

                {/* Currently Applied Coupon Banner */}
                {appliedCoupon && (
                  <div className="bg-success-soft border border-success/30 rounded-2xl p-4 shadow-xs relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3 relative z-10">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-ink tracking-wider">
                              {appliedCoupon.code}
                            </span>
                            <span className="bg-success/20 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">
                              ACTIVE NOW
                            </span>
                          </div>
                          <p className="text-xs text-success font-bold mt-1">
                            Saving ₹{Number(appliedCoupon.discountAmount || 0).toLocaleString('en-IN')} on your order!
                          </p>
                          <p className="text-[11px] text-muted mt-0.5">
                            {appliedCoupon.description}
                          </p>
                        </div>
                      </div>

                      {onRemoveCoupon && (
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          onClick={onRemoveCoupon}
                          className="text-[11px] font-bold text-danger hover:text-danger/80 bg-surface px-2.5 py-1.5 rounded-lg border border-danger/30 transition-colors shrink-0"
                        >
                          Remove
                        </motion.button>
                      )}
                    </div>
                  </div>
                )}

                {/* Available Offers Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                      Best Available Coupons
                    </h3>
                    <span className="text-[11px] text-muted">Tap to apply instantly</span>
                  </div>

                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className="h-28 bg-canvas border border-line rounded-2xl animate-pulse"
                        />
                      ))}
                    </div>
                  ) : coupons.length === 0 ? (
                    <div className="text-center py-8 text-muted text-xs">
                      No active public coupons found right now.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {coupons.map((c) => {
                        const isApplied = appliedCoupon?.code === c.code;
                        const isEligible = currentSubtotal >= c.minCartValue;
                        const savings = calculateSavings(c);
                        const neededMore = Math.max(0, c.minCartValue - currentSubtotal);
                        const progress = Math.min(
                          100,
                          Math.round((currentSubtotal / c.minCartValue) * 100)
                        );

                        return (
                          <div
                            key={c.code}
                            className={`relative rounded-2xl border transition-all overflow-hidden bg-surface ${
                              isApplied
                                ? 'border-success ring-2 ring-success/20 shadow-xs'
                                : isEligible
                                ? 'border-line hover:border-brand/40 hover:shadow-md'
                                : 'border-line/60 bg-canvas/40 opacity-80'
                            }`}
                          >
                            {/* Decorative Cutout Content */}
                            <div className="p-4 sm:p-4.5 space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  {/* Code Chip */}
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-lg tracking-wider">
                                      {c.code}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => handleCopyCode(c.code, e)}
                                      className="p-1 text-muted hover:text-ink rounded transition-colors"
                                      title="Copy code"
                                    >
                                      {copiedCode === c.code ? (
                                        <Check className="w-3.5 h-3.5 text-success" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>

                                    {/* Discount Badge */}
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-warning-soft text-warning border border-warning/20 rounded-md">
                                      {c.discountType === 'percentage'
                                        ? `${c.discountValue}% OFF`
                                        : `FLAT ₹${c.discountValue} OFF`}
                                    </span>
                                  </div>

                                  {/* Description */}
                                  <p className="text-xs text-ink font-medium mt-2 leading-relaxed">
                                    {c.description}
                                  </p>
                                </div>

                                {/* Apply or Applied Button */}
                                <div>
                                  {isApplied ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success bg-success-soft border border-success/30 px-3 py-1.5 rounded-xl">
                                      <Check className="w-3 h-3 text-success" /> Applied
                                    </span>
                                  ) : (
                                    <motion.button
                                      whileHover={{ scale: 1.04 }}
                                      whileTap={{ scale: 0.94 }}
                                      type="button"
                                      disabled={isApplying || !isEligible}
                                      onClick={() => executeApply(c.code)}
                                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs ${
                                        isEligible
                                          ? 'bg-brand hover:bg-brand-dark text-white'
                                          : 'bg-canvas border border-line text-muted cursor-not-allowed'
                                      }`}
                                    >
                                      Apply
                                    </motion.button>
                                  )}
                                </div>
                              </div>

                              {/* Footer calculations & eligibility */}
                              <div className="pt-2 border-t border-line flex items-center justify-between text-[11px]">
                                {isEligible ? (
                                  <div className="flex items-center gap-1.5 text-success font-bold font-mono">
                                    <TrendingDown className="w-3.5 h-3.5" />
                                    <span>
                                      Saves ₹{savings.toLocaleString('en-IN')} on this order!
                                    </span>
                                  </div>
                                ) : (
                                  <div className="w-full space-y-1">
                                    <div className="flex items-center justify-between text-muted">
                                      <span>
                                        Add ₹{neededMore.toLocaleString('en-IN')} more to unlock
                                      </span>
                                      <span className="font-bold text-ink font-mono">
                                        ₹{currentSubtotal} / ₹{c.minCartValue}
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-canvas border border-line/40 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-brand rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 sm:p-5 border-t border-line bg-surface flex items-center justify-between">
                <span className="text-xs text-muted flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand" />
                  Guaranteed genuine discounts
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-4 py-2 bg-canvas hover:bg-surface border border-line text-ink text-xs font-semibold rounded-xl transition-all"
                >
                  Continue Shopping
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
