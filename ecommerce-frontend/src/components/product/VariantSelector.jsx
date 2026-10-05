import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function VariantSelector({ variants = [], selectedVariant, onSelectVariant }) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-muted font-mono">
          Select Option / Variant
        </label>
        {selectedVariant?.sku && (
          <span className="text-xs text-muted font-medium">
            SKU: <span className="font-mono text-ink">{selectedVariant.sku}</span>
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
              whileTap={!isOut ? { scale: 0.97 } : undefined}
              type="button"
              disabled={isOut}
              onClick={() => onSelectVariant(variant)}
              className={cn(
                'p-2.5 rounded-sm border text-left flex flex-col justify-between transition-colors',
                isSelected
                  ? 'border-ink bg-line/20 text-ink font-semibold ring-1 ring-ink'
                  : isOut
                  ? 'border-line/60 bg-canvas/60 opacity-40 cursor-not-allowed text-muted'
                  : 'border-line bg-surface hover:border-ink/40 text-ink'
              )}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold truncate tracking-tight">{label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
              </div>

              <div className="flex items-baseline justify-between gap-2 mt-1 tabular-nums">
                <span className="text-sm font-bold text-ink">
                  ₹{(variant.price || 0).toLocaleString('en-IN')}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    isOut
                      ? 'text-danger'
                      : variant.stock <= 5
                      ? 'text-warning font-semibold'
                      : 'text-success'
                  )}
                >
                  {isOut ? 'Sold Out' : variant.stock <= 5 ? `${variant.stock} left` : 'In Stock'}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
