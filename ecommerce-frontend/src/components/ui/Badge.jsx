import React from 'react';
import { cn } from '../../utils/cn';

const variantClasses = {
  subtle: {
    brand: 'bg-brand-soft text-brand-dark border-transparent',
    accent: 'bg-accent-soft text-accent border-transparent',
    success: 'bg-success-soft text-success border-transparent',
    warning: 'bg-warning-soft text-warning border-transparent',
    danger: 'bg-danger-soft text-danger border-transparent',
    neutral: 'bg-n-50 text-n-700 border-transparent',
  },
  solid: {
    brand: 'bg-brand text-white border-transparent',
    accent: 'bg-accent text-white border-transparent',
    success: 'bg-success text-white border-transparent',
    warning: 'bg-warning text-white border-transparent',
    danger: 'bg-danger text-white border-transparent',
    neutral: 'bg-ink text-canvas border-transparent',
  },
  outline: {
    brand: 'border-brand text-brand bg-transparent',
    accent: 'border-accent text-accent bg-transparent',
    success: 'border-success text-success bg-transparent',
    warning: 'border-warning text-warning bg-transparent',
    danger: 'border-danger text-danger bg-transparent',
    neutral: 'border-n-300 text-n-700 bg-transparent',
  },
};

const dotClasses = {
  brand: 'bg-brand',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  neutral: 'bg-muted',
};

export function Badge({
  children,
  className,
  color = 'neutral',
  variant = 'subtle',
  size = 'sm',
  dot = false,
  ...props
}) {
  const sizeStyles = {
    sm: 'h-5 text-[11px] font-semibold uppercase tracking-wider px-1.5 rounded-sm',
    md: 'h-6 text-xs font-semibold uppercase tracking-wider px-2 rounded-sm',
  };

  const currentVariant = variantClasses[variant] || variantClasses.subtle;
  const colorStyle = currentVariant[color] || currentVariant.neutral;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border font-sans select-none leading-none',
        sizeStyles[size] || sizeStyles.sm,
        colorStyle,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotClasses[color] || dotClasses.neutral
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
