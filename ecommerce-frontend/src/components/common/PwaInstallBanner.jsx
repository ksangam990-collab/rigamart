import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Logo from './Logo.jsx';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.__rigamart_pwa_prompt = e;
      setDeferredPrompt(e);
      
      const dismissedAt = localStorage.getItem('pwa-dismissed-at');
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt, 10);
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - dismissedTime < sevenDays) {
          return;
        }
      }
      
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-dismissed-at', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 p-4 bg-surface border-t border-line shadow-elevation flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size="small" variant="icon" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-ink">Install Rigamart App</span>
            <span className="text-xs text-muted">For a better experience</span>
          </div>
        </div>
        <button onClick={handleDismiss} className="p-1 text-muted hover:text-ink">
          <X className="w-5 h-5" />
        </button>
      </div>
      <button
        onClick={handleInstallClick}
        className="w-full py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition-colors"
      >
        Install Now
      </button>
    </div>
  );
}
