import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle } from 'lucide-react';

export default function VariantSelector({ variants = [], selectedVariant, onSelectVariant }) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Select Variant / Option
        </label>
        {selectedVariant && (
          <span className="text-xs text-gray-500 font-medium">
            SKU: <span className="font-mono text-gray-700">{selectedVariant.sku || 'N/A'}</span>
          </span>
        )}
      </div>

      {/* Variant Pills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {variants.map((variant) => {
          const isSelected = selectedVariant?._id === variant._id;
          const isOut = (variant.stock || 0) <= 0;

          const label = variant.attributes
            ? Object.entries(variant.attributes)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')
            : variant.sku || `Option ₹${variant.price}`;

          return (
            <motion.button
              key={variant._id}
              whileTap={!isOut ? { scale: 0.96 } : undefined}
              whileHover={!isOut && !isSelected ? { y: -2 } : undefined}
              type="button"
              disabled={isOut}
              onClick={() => onSelectVariant(variant)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500 shadow-sm'
                  : isOut
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-gray-800 line-clamp-1">{label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />}
              </div>

              <div className="flex items-baseline justify-between gap-2 mt-1">
                <span className="text-sm font-black text-gray-900">
                  ₹{(variant.price || 0).toLocaleString('en-IN')}
                </span>
                <span
                  className={`text-[10px] font-semibold ${
                    isOut
                      ? 'text-red-600'
                      : variant.stock <= 5
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {isOut ? 'Sold Out' : `${variant.stock} left`}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Stock Urgency Indicator */}
      <AnimatePresence mode="wait">
        {selectedVariant && (
          <motion.div
            key={selectedVariant._id + (selectedVariant.stock <= 0 ? 'out' : selectedVariant.stock <= 5 ? 'low' : 'in')}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="pt-1"
          >
            {selectedVariant.stock <= 0 ? (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-100">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>This variant is currently out of stock. Please select another option.</span>
              </div>
            ) : selectedVariant.stock <= 5 ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Hurry! Only {selectedVariant.stock} items left in stock.</span>
              </div>
            ) : (
              <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                In Stock & Ready for Express Dispatch
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
