import React, { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      prefix,
      suffix,
      className,
      containerClassName,
      id,
      disabled,
      required,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const hasError = Boolean(error);

    return (
      <div className={cn('w-full flex flex-col gap-1', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-muted flex items-center justify-between tracking-tight"
          >
            <span>
              {label}
              {required && <span className="text-danger ml-0.5">*</span>}
            </span>
          </label>
        )}

        <div
          className={cn(
            'group relative flex items-center w-full bg-surface border rounded h-11 overflow-hidden',
            'transition-colors duration-150 ease-out',
            'border-n-300 hover:border-n-500 focus-within:border-ink focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2 focus-within:ring-offset-canvas',
            hasError && 'border-danger hover:border-danger focus-within:border-danger focus-within:ring-danger',
            disabled && 'opacity-60 bg-n-50 cursor-not-allowed pointer-events-none'
          )}
        >
          {prefix && (
            <div className="pl-3.5 pr-1.5 flex items-center justify-center text-muted shrink-0 pointer-events-none">
              {prefix}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              'w-full h-full px-3.5 text-base md:text-[15px] bg-transparent text-ink placeholder:text-muted/60',
              'font-sans outline-none disabled:cursor-not-allowed',
              prefix && 'pl-1.5',
              suffix && 'pr-1.5',
              className
            )}
            {...props}
          />

          {suffix && (
            <div className="pr-3.5 pl-1.5 flex items-center justify-center text-muted shrink-0">
              {suffix}
            </div>
          )}
        </div>

        {hasError && (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium text-danger flex items-center gap-1 mt-0.5"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </p>
        )}

        {!hasError && helperText && (
          <p id={helperId} className="text-[12px] text-muted mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
