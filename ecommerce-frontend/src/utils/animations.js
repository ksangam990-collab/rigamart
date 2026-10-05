/**
 * Shared Framer Motion Animation Variants & Transition Utilities
 * Designed for Rigamart (E-commerce Marketplace)
 * Follows premium D2C & Flipkart/Myntra motion standards:
 * - Snappy micro-interactions (150-300ms)
 * - Cubic-bezier smooth easing curves
 * - Accessible prefers-reduced-motion fallbacks
 */

// Premium Easing Curves
export const EASINGS = {
  easeOutCubic: [0.22, 1, 0.36, 1],
  easeInOutCubic: [0.65, 0, 0.35, 1],
  springSnappy: { type: 'spring', stiffness: 400, damping: 30 },
  springGentle: { type: 'spring', stiffness: 280, damping: 25 },
};

// Page Transition Variants (fade only to prevent CSS transform containing block breaking position: sticky)
export const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.22,
      ease: EASINGS.easeOutCubic,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: EASINGS.easeOutCubic,
    },
  },
};

// Reduced motion fallback for page transition
export const pageVariantsReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

// Fade In Up Reveal (For scroll sections or headers)
export const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (custom = {}) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: custom.duration || 0.35,
      delay: custom.delay || 0,
      ease: EASINGS.easeOutCubic,
    },
  }),
};

// Stagger Container
export const staggerContainer = (staggerChildren = 0.05, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

// Stagger Child Item (e.g. Product Cards, Grid Items)
export const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: EASINGS.easeOutCubic,
    },
  },
};

// Micro-interaction presets for interactive buttons & links
export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.15, ease: EASINGS.easeOutCubic },
};

// Product Card Hover
export const productCardMotion = {
  initial: { y: 0, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.04)' },
  hover: {
    y: -4,
    boxShadow: '0 12px 24px -6px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.05)',
    transition: { duration: 0.22, ease: EASINGS.easeOutCubic },
  },
};

// Modal Backdrop & Content Variants
export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

export const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.22, ease: EASINGS.easeOutCubic },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.16, ease: 'easeIn' },
  },
};

export const modalPanelVariants = modalContentVariants;

// Drawer / Slide-Down Menu Variants
export const drawerSlideDown = {
  hidden: { opacity: 0, height: 0, overflow: 'hidden' },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.25, ease: EASINGS.easeOutCubic },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.18, ease: EASINGS.easeOutCubic },
  },
};

// Wishlist Heart Bounce
export const heartBounceVariants = {
  idle: { scale: 1 },
  active: {
    scale: [1, 1.35, 0.92, 1],
    transition: { duration: 0.32, ease: EASINGS.easeOutCubic },
  },
};

// Cart Counter Badge Pulse
export const badgePulse = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: [1, 1.25, 1],
    opacity: 1,
    transition: { duration: 0.3, ease: EASINGS.easeOutCubic },
  },
};
