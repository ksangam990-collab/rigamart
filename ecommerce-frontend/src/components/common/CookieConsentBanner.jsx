import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already acknowledged cookie preferences
    const consent = localStorage.getItem('rigamart_cookie_consent');
    if (!consent) {
      // Small 1s delay so it doesn't pop up abruptly on initial page load
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('rigamart_cookie_consent', JSON.stringify({
      acceptedAt: new Date().toISOString(),
      essential: true,
      analytics: true,
      preferences: true
    }));
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('rigamart_cookie_consent', JSON.stringify({
      acceptedAt: new Date().toISOString(),
      essential: true,
      analytics: false,
      preferences: false
    }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-surface/95 backdrop-blur-md border border-line rounded-2xl shadow-elevation p-5 text-ink space-y-3.5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                Cookie & Privacy Choices
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
              </h4>
              <p className="text-[11px] text-muted leading-relaxed mt-0.5">
                We use secure cookies to remember your login, persist your cart, and secure your transactions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAcceptEssential}
            className="p-1 text-muted hover:text-ink transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted pt-0.5 border-t border-line/60">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-success" />
            256-bit Encrypted
          </span>
          <Link to="/privacy" className="text-brand hover:underline font-medium">
            Read Privacy Policy
          </Link>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleAcceptEssential}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl border border-line bg-canvas hover:bg-surface text-ink transition-colors"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-brand hover:bg-brand-dark text-white transition-colors shadow-subtle"
          >
            Accept All
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
