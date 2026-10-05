import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Sheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  maxWidth = 'md:max-w-[420px]',
}) {
  // Prevent body scrolling when sheet is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop (Scrim: rgb(10 10 10 / .4)) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0A0A0A]/40 transition-opacity"
            aria-hidden="true"
          />

          {/* Desktop Drawer (Slide right, 420px) / Mobile Bottom Sheet (radius 12px) */}
          <motion.div
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 400) {
                onClose();
              }
            }}
            className={cn(
              'relative z-10 w-full bg-surface text-ink flex flex-col shadow-overlay border-line',
              // Mobile style: rounded top corners (12px), max height
              'max-h-[90vh] rounded-t-sheet md:rounded-none border-t md:border-t-0 md:border-l',
              // Desktop style: full height right rail (width 420px)
              'md:h-full md:max-h-full md:w-[420px]',
              maxWidth,
              className
            )}
          >
            {/* Mobile Drag Grab Handle */}
            <div className="md:hidden flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 bg-n-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex items-start justify-between border-b border-line shrink-0">
              <div className="pr-4">
                {title && (
                  <h3 className="text-base font-semibold text-ink tracking-tight font-sans">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-xs text-muted mt-0.5">{description}</p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 -mr-2 -mt-1 text-muted hover:text-ink hover:bg-n-50 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="p-6 overflow-y-auto overscroll-contain flex-1">
              {children}
            </div>

            {/* Footer / Sticky Action Bar */}
            {footer && (
              <div className="px-6 py-4 border-t border-line bg-surface shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Sheet;
