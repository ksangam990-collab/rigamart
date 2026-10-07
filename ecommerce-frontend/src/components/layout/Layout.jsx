import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import PageTransition from '../common/PageTransition';
import PwaInstallBanner from '../common/PwaInstallBanner';
import CookieConsentBanner from '../common/CookieConsentBanner';

export default function Layout() {
  const location = useLocation();

  React.useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const scroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      scroll();
      const timer = setTimeout(scroll, 200);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink font-sans antialiased transition-colors duration-150">
      <Navbar />
      {/* pb-16 on mobile compensates for the fixed BottomNav height */}
      <main className="flex-1 flex flex-col pb-16 md:pb-0">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <PwaInstallBanner />
      <CookieConsentBanner />
      <Footer />
      <BottomNav />
    </div>
  );
}
