import React from 'react';
import Skeleton from '../ui/Skeleton.jsx';

/**
 * ProductCardSkeleton 2.0
 * Matches exact aspect-[4/5] geometry of ProductCard 2.0 to eliminate Cumulative Layout Shift (CLS).
 */
export default function ProductCardSkeleton() {
  return (
    <div className="bg-surface rounded-card border border-line shadow-subtle flex flex-col overflow-hidden animate-pulse">
      {/* 4:5 Media Aspect Ratio */}
      <div className="w-full aspect-[4/5] bg-line/60" />

      {/* Product Content Placeholder */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Brand & rating */}
          <div className="flex items-center justify-between">
            <Skeleton variant="text" className="w-1/3 h-3" />
            <Skeleton variant="text" className="w-10 h-3" />
          </div>
          {/* Title lines */}
          <Skeleton variant="text" className="w-4/5 h-4" />
          <Skeleton variant="text" className="w-3/5 h-4" />
        </div>

        {/* Price & action placeholder */}
        <div className="pt-3 border-t border-line flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton variant="text" className="w-20 h-5" />
            <Skeleton variant="text" className="w-12 h-3" />
          </div>
          <Skeleton className="w-9 h-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
