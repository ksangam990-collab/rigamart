import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Sparkles, MapPin, Copy, Check } from 'lucide-react';

export default function BankOfferTicker() {
  const [copied, setCopied] = useState(false);
  const [activeOfferIdx, setActiveOfferIdx] = useState(0);

  const offers = [
    {
      code: 'RIGAMART10',
      title: '10% Instant Discount on HDFC, SBI & ICICI Cards',
      shortTitle: '10% Off on Top Bank Cards',
      subtext: 'Min order ₹1,499 | Max discount ₹750',
      tag: 'BANK OFFER'
    },
    {
      code: 'SUPERFESTIVE',
      title: 'Flat ₹300 Off on First UPI Order via Razorpay & PhonePe',
      shortTitle: '₹300 Off on First UPI',
      subtext: 'Zero processing fee | Instant cashback in wallet',
      tag: 'UPI CASHBACK'
    },
    {
      code: 'EXPRESS24',
      title: 'Free Express 24h Metro Delivery on Orders ₹499+',
      shortTitle: 'Free 24h Metro Delivery',
      subtext: 'Dispatched from nearest regional fulfillment hub',
      tag: 'FAST DISPATCH'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveOfferIdx((prev) => (prev + 1) % offers.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [offers.length]);

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const current = offers[activeOfferIdx];

  return (
    <div className="hidden sm:block w-full bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-amber-500/10 text-ink shadow-xs border-b border-amber-200/70 dark:border-amber-900/40 relative z-20">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-1.5 sm:py-2 flex items-center justify-between gap-2.5 sm:gap-3 text-xs">
        
        {/* Left: Animated Bank Offer Ticker */}
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-hidden flex-1 min-w-0">
          <span className="bg-amber-500 text-white font-extrabold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full tracking-wider uppercase shrink-0 shadow-xs">
            {current.tag}
          </span>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeOfferIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 hidden sm:inline" />
              <span className="font-semibold text-[11px] sm:text-xs text-ink truncate shrink-0 max-w-[170px] sm:max-w-none">
                <span className="hidden sm:inline">{current.title}</span>
                <span className="sm:hidden">{current.shortTitle}</span>
              </span>
              <span className="text-muted text-[10.5px] hidden md:inline">
                • {current.subtext}
              </span>
              <button
                type="button"
                onClick={() => copyCode(current.code)}
                className="inline-flex items-center gap-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-mono text-[9.5px] sm:text-[10px] px-2 py-0.5 rounded-full transition-all shrink-0 cursor-pointer active:scale-95 ml-auto sm:ml-0"
                title="Copy coupon code"
              >
                <span>Code: <strong className="text-ink">{current.code}</strong></span>
                {copied ? (
                  <Check className="w-2.5 h-2.5 text-emerald-300" />
                ) : (
                  <Copy className="w-2.5 h-2.5 text-amber-300" />
                )}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Location & SuperCoins Badges (Desktop) */}
        <div className="hidden sm:flex items-center gap-3.5 shrink-0 text-muted text-[11px] font-medium">
          <div className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Deliver to: <strong className="text-ink underline underline-offset-2">Bengaluru 560001</strong></span>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-500/15 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-300/50">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <strong className="font-mono text-white text-[10px]">140 SuperCoins</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
