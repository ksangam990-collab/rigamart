import React from 'react';

/**
 * Skeleton component mirroring ProductCard layout
 * Displays a subtle animated shimmer while catalog data loads
 */
export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-square bg-gray-200/80 w-full" />

      {/* Content placeholder */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Brand tag */}
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          {/* Title lines */}
          <div className="h-4 bg-gray-200 rounded w-4/5" />
          <div className="h-4 bg-gray-200 rounded w-3/5" />
          {/* Rating */}
          <div className="h-4 bg-gray-200 rounded w-16 mt-2" />
        </div>

        {/* Price & action button */}
        <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-5 bg-gray-200 rounded w-20" />
            <div className="h-2.5 bg-gray-100 rounded w-12" />
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
