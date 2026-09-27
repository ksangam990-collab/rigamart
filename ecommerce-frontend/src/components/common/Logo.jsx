import React from 'react';

/**
 * Rigamart Brand Identity Logo Component ("R-Pulse")
 * 
 * Features:
 * - Mathematical SVG vector geometry (infinitely scalable, crisp down to 16px)
 * - Concept A ("R-Pulse"): Royal Blue squircle + crisp white R stem/loop + upward Indian Saffron pulse arrow
 * - Themeable via CSS variables & currentColor for future dark mode support
 * - Variants: 'full' (icon + wordmark) and 'icon' (standalone mark)
 */
export default function Logo({
  variant = 'full',
  size = 'md',
  className = '',
  monochrome = false,
  wordmarkColor = 'default' // 'default' (dark slate), 'white', or 'currentColor'
}) {
  // Dimension scales
  const scales = {
    sm: { height: 26, iconSize: 26, fullWidth: 125, textClass: 'text-base', iconClass: 'w-6 h-6' },
    md: { height: 36, iconSize: 36, fullWidth: 165, textClass: 'text-xl', iconClass: 'w-9 h-9' },
    lg: { height: 44, iconSize: 44, fullWidth: 200, textClass: 'text-2xl', iconClass: 'w-11 h-11' },
    xl: { height: 52, iconSize: 52, fullWidth: 240, textClass: 'text-3xl', iconClass: 'w-13 h-13' },
    responsive: { height: 32, iconSize: 32, fullWidth: 150, textClass: 'text-lg sm:text-xl md:text-2xl', iconClass: 'w-7 h-7 sm:w-9 sm:h-9' }
  };

  const currentScale = scales[size] || scales.responsive;

  // Color tokens
  const blueGradientStart = monochrome ? 'currentColor' : '#2563EB';
  const blueGradientEnd = monochrome ? 'currentColor' : '#1D4ED8';
  const saffronColor = monochrome ? 'currentColor' : '#FF7A00';
  const saffronGradEnd = monochrome ? 'currentColor' : '#FF5400';
  const rLetterColor = monochrome ? 'rgba(0, 0, 0, 0.2)' : '#FFFFFF';

  // Wordmark color logic
  let wordmarkLeadColor = '#0F172A';
  let wordmarkTailColor = '#2563EB';

  if (wordmarkColor === 'white') {
    wordmarkLeadColor = '#F8FAFC';
    wordmarkTailColor = '#60A5FA';
  } else if (wordmarkColor === 'currentColor') {
    wordmarkLeadColor = 'currentColor';
    wordmarkTailColor = 'currentColor';
  }

  // Unique ID prefix for gradients to prevent collision in DOM
  const gradId = React.useId ? React.useId().replace(/:/g, '') : 'rm';

  if (variant === 'icon') {
    return (
      <svg
        width={currentScale.iconSize}
        height={currentScale.iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 transition-transform duration-200 ${className}`}
        aria-label="Rigamart Logo Icon"
      >
        <defs>
          <linearGradient id={`${gradId}-bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={blueGradientStart} />
            <stop offset="100%" stopColor={blueGradientEnd} />
          </linearGradient>
        </defs>

        {/* Element 1: Royal Blue Squircle App Icon Container */}
        <rect width="40" height="40" rx="10" fill={`url(#${gradId}-bg)`} />

        {/* Element 2: Solid White R Silhouette Glyph */}
        <path
          d="M11 9C11 7.9 11.9 7 13 7H23C27.4 7 31 10.4 31 14.8C31 18.5 28.5 21.6 25 22.4L31.2 31.6C31.8 32.5 31.1 33.7 30 33.7H25.5C24.8 33.7 24.2 33.3 23.8 32.7L18.5 23.5H16.5V32.5C16.5 33.3 15.8 34 15 34H12.5C11.7 34 11 33.3 11 32.5V9ZM16.5 18H22C24 18 25.5 16.5 25.5 14.7C25.5 12.9 24 11.4 22 11.4H16.5V18Z"
          fill={rLetterColor}
        />

        {/* Subtle Saffron Accent Spark */}
        <circle cx="31.5" cy="8.5" r="3" fill={saffronColor} />
      </svg>
    );
  }

  // Full Logo: Icon Badge + Plus Jakarta Sans Wordmark + Accent Spark
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Mark */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${currentScale.iconClass}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${gradId}-full-bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={blueGradientStart} />
            <stop offset="100%" stopColor={blueGradientEnd} />
          </linearGradient>
        </defs>

        <rect width="40" height="40" rx="10" fill={`url(#${gradId}-full-bg)`} />
        <path
          d="M11 9C11 7.9 11.9 7 13 7H23C27.4 7 31 10.4 31 14.8C31 18.5 28.5 21.6 25 22.4L31.2 31.6C31.8 32.5 31.1 33.7 30 33.7H25.5C24.8 33.7 24.2 33.3 23.8 32.7L18.5 23.5H16.5V32.5C16.5 33.3 15.8 34 15 34H12.5C11.7 34 11 33.3 11 32.5V9ZM16.5 18H22C24 18 25.5 16.5 25.5 14.7C25.5 12.9 24 11.4 22 11.4H16.5V18Z"
          fill={rLetterColor}
        />
        <circle cx="31.5" cy="8.5" r="3" fill={saffronColor} />
      </svg>

      {/* Styled Wordmark */}
      <span
        className={`font-sans font-extrabold tracking-tight flex items-baseline leading-none ${currentScale.textClass}`}
      >
        <span style={{ color: wordmarkLeadColor }}>Riga</span>
        <span style={{ color: wordmarkTailColor }}>mart</span>
        <span
          className="inline-block w-1.5 h-1.5 rounded-full ml-0.5"
          style={{ backgroundColor: saffronColor }}
        />
      </span>
    </div>
  );
}
