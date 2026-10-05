import React from 'react';
import { cn } from '../../utils/cn';

export function Skeleton({ className, variant = 'rectangular', ...props }) {
  const variantStyles = {
    rectangular: 'rounded-none',
    circular: 'rounded-full',
    text: 'h-4 rounded-sm',
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-n-50 dark:bg-n-100 transition-colors',
        variantStyles[variant] || 'rounded-none',
        className
      )}
      {...props}
    />
  );
}

export default Skeleton;
