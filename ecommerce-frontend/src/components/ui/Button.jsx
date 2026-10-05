import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const variantClasses = {
  primary:
    'bg-brand text-white hover:bg-brand-dark active:bg-brand-dark shadow-subtle focus-visible:ring-brand',
  secondary:
    'bg-surface text-ink hover:bg-canvas border border-line shadow-subtle focus-visible:ring-line',
  outline:
    'bg-transparent border border-brand text-brand hover:bg-brand-soft focus-visible:ring-brand',
  ghost:
    'bg-transparent text-ink hover:bg-brand-soft/60 active:bg-brand-soft focus-visible:ring-brand',
  destructive:
    'bg-danger text-white hover:bg-danger/90 active:bg-danger/90 shadow-subtle focus-visible:ring-danger',
  accent:
    'bg-accent text-ink hover:brightness-95 active:brightness-90 shadow-subtle font-semibold focus-visible:ring-accent',
};

const sizeClasses = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
  icon: 'h-10 w-10 p-0 rounded-xl justify-center',
  'icon-sm': 'h-8 w-8 p-0 rounded-lg justify-center',
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
          'inline-flex items-center justify-center font-medium font-sans select-none tracking-tight',
          'transition-all duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
          'active:scale-[0.98]',
          variantClasses[variant] || variantClasses.primary,
          sizeClasses[size] || sizeClasses.md,
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none active:scale-100',
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
