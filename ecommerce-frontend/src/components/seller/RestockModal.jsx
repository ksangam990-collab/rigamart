import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertCircle } from 'lucide-react';
import api from '../../utils/api.js';
import { modalBackdropVariants, modalContentVariants } from '../../utils/animations.js';

export default function RestockModal({ isOpen, onClose, product, variant, onStockUpdated }) {
  const [stock, setStock] = useState(variant?.stock || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.patch(
        `/seller/products/${product._id}/variants/${variant._id}/stock`,
        { stock: parseInt(stock, 10) }
      );
      if (onStockUpdated) onStockUpdated(product._id, variant._id, parseInt(stock, 10));
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && product && variant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-surface rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-4 z-10 border border-line"
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-muted hover:text-ink rounded-lg hover:bg-canvas transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>

            <div>
              <h3 className="text-lg font-bold text-ink tracking-tight">Update Variant Stock</h3>
              <p className="text-xs text-muted mt-0.5 line-clamp-1">{product.name}</p>
              <p className="text-[11px] font-mono text-brand mt-0.5">SKU: {variant.sku}</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-danger-soft text-danger text-xs rounded-lg border border-danger/20"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-danger" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                  Available Units
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-line rounded-lg text-sm font-semibold text-ink outline-none focus:bg-surface focus:border-brand transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 border border-line text-muted text-xs font-semibold rounded-lg hover:bg-canvas hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
