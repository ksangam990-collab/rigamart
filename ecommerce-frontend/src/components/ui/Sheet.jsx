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
  maxWidth = 'max-w-md',
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Desktop Drawer (Slide right) / Mobile Bottom Sheet (Slide up + drag dismiss) */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 400) {
                onClose();
              }
            }}
            className={cn(
              'relative z-10 w-full bg-surface text-ink flex flex-col shadow-elevation',
              // Mobile style: rounded top sheet, max height
              'max-h-[90vh] rounded-t-sheet md:rounded-none',
              // Desktop style: full height right rail
              'md:h-full md:max-h-full md:w-full',
              maxWidth,
              className
            )}
          >
            {/* Mobile Drag Indicator Pill */}
            <div className="md:hidden flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 bg-line rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex items-start justify-between border-b border-line shrink-0">
              <div className="pr-4">
                {title && (
                  <h3 className="text-base font-semibold text-ink tracking-tight">
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
                className="p-1.5 -mr-1.5 -mt-1 text-muted hover:text-ink hover:bg-canvas rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="p-6 overflow-y-auto overscroll-contain flex-1">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-line bg-canvas/40 shrink-0">
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
