import React from 'react';
import { cn } from '../../utils/cn';

const variantClasses = {
  subtle: {
    brand: 'bg-brand-soft text-brand-dark border-transparent',
    accent: 'bg-accent/15 text-accent border-transparent',
    success: 'bg-success/15 text-success border-transparent',
    warning: 'bg-warning/15 text-warning border-transparent',
    danger: 'bg-danger/15 text-danger border-transparent',
    neutral: 'bg-line/40 text-muted border-transparent',
  },
  solid: {
    brand: 'bg-brand text-white border-transparent',
    accent: 'bg-accent text-ink border-transparent font-semibold',
    success: 'bg-success text-white border-transparent',
    warning: 'bg-warning text-white border-transparent',
    danger: 'bg-danger text-white border-transparent',
    neutral: 'bg-muted text-white border-transparent',
  },
  outline: {
    brand: 'border-brand text-brand bg-transparent',
    accent: 'border-accent text-accent bg-transparent',
    success: 'border-success text-success bg-transparent',
    warning: 'border-warning text-warning bg-transparent',
    danger: 'border-danger text-danger bg-transparent',
    neutral: 'border-line text-muted bg-transparent',
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
  color = 'brand',
  variant = 'subtle',
  size = 'sm',
  dot = false,
  ...props
}) {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full font-medium tracking-tight',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium tracking-tight',
  };

  const currentVariant = variantClasses[variant] || variantClasses.subtle;
  const colorStyle = currentVariant[color] || currentVariant.brand;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border font-sans select-none',
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
            dotClasses[color] || dotClasses.brand
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
