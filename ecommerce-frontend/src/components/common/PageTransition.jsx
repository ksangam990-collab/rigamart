import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { pageVariants, pageVariantsReduced } from '../../utils/animations';

/**
 * Reusable PageTransition wrapper
 * Provides smooth, subtle route transitions across all pages
 * Automatically respects user's OS prefers-reduced-motion setting
 */
export default function PageTransition({ children, className = '' }) {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion ? pageVariantsReduced : pageVariants;

  useEffect(() => {
    if (window.location.hash) {
      const targetId = window.location.hash.replace('#', '');
      const scrollToElement = () => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
      };
      // Try immediate and with slight delay for dynamic mounts
      scrollToElement();
      const timer = setTimeout(scrollToElement, 150);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: shouldReduceMotion ? 'auto' : 'instant' });
    }
  }, [shouldReduceMotion]);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
