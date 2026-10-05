import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const variantClasses = {
  primary:
    'bg-ink text-canvas hover:bg-n-700 active:bg-n-900 border border-transparent focus-visible:ring-brand shadow-none',
  secondary:
    'bg-transparent text-ink hover:bg-n-50 active:bg-n-100 border border-ink focus-visible:ring-brand shadow-none',
  outline:
    'bg-transparent text-ink hover:bg-n-50 active:bg-n-100 border border-line focus-visible:ring-brand shadow-none',
  ghost:
    'bg-transparent text-ink hover:bg-n-50 active:bg-n-100 border border-transparent focus-visible:ring-brand shadow-none',
  brand:
    'bg-brand text-white hover:bg-brand-dark active:bg-brand-dark border border-transparent focus-visible:ring-brand shadow-none',
  accent:
    'bg-brand text-white hover:bg-brand-dark active:bg-brand-dark border border-transparent focus-visible:ring-brand shadow-none',
  destructive:
    'bg-danger text-white hover:bg-danger/90 active:bg-danger/90 border border-transparent focus-visible:ring-danger shadow-none',
};

const sizeClasses = {
  sm: 'h-10 px-3.5 text-xs font-semibold rounded gap-1.5',
  md: 'h-11 px-4 text-sm font-semibold rounded gap-2',
  lg: 'h-12 px-6 text-sm sm:text-base font-semibold rounded gap-2.5',
  icon: 'h-11 w-11 p-0 rounded justify-center',
  'icon-sm': 'h-10 w-10 p-0 rounded justify-center',
};

export const Button = forwardRef(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-sans select-none tracking-tight',
          'transition-colors duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
          'active:scale-[0.99]',
          variantClasses[variant] || variantClasses.primary,
          sizeClasses[size] || sizeClasses.md,
          isDisabled && 'opacity-40 cursor-not-allowed pointer-events-none active:scale-100',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 shrink-0 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">Loading...</span>
            {children && <span className="opacity-80">{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
