import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import PageTransition from '../common/PageTransition';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
