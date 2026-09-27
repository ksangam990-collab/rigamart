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
    // Scroll window to top smoothly when page changes
    window.scrollTo({ top: 0, left: 0, behavior: shouldReduceMotion ? 'auto' : 'instant' });
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
