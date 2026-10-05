import React from 'react';
import { cn } from '../../utils/cn';

export function Skeleton({ className, variant = 'rectangular', ...props }) {
  const variantStyles = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'h-4 rounded-md',
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-line/60 dark:bg-line/40 transition-colors',
        variantStyles[variant] || 'rounded-xl',
        className
      )}
      {...props}
    />
  );
}

export default Skeleton;
