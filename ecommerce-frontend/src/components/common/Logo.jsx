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
    sm: { height: 28, iconSize: 28, fullWidth: 130 },
    md: { height: 36, iconSize: 36, fullWidth: 165 },
    lg: { height: 44, iconSize: 44, fullWidth: 200 },
    xl: { height: 52, iconSize: 52, fullWidth: 240 }
  };

  const currentScale = scales[size] || scales.md;

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
          <linearGradient id={`${gradId}-saffron`} x1="16" y1="30" x2="30" y2="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={saffronColor} />
            <stop offset="100%" stopColor={saffronGradEnd} />
          </linearGradient>
        </defs>

        {/* Squircle App Icon Container */}
        <rect width="40" height="40" rx="10.5" fill={`url(#${gradId}-bg)`} />

        {/* White R Stem */}
        <rect x="9.5" y="9" width="4.8" height="22" rx="2.4" fill={rLetterColor} />

        {/* White R Upper Loop */}
        <path
          d="M11.5 11.5H20.5C24.366 11.5 27.5 14.4101 27.5 18C27.5 21.5899 24.366 24.5 20.5 24.5H11.5"
          stroke={rLetterColor}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Saffron Upward Pulse / Growth Arrow */}
        <path
          d="M15.5 30.5C18 30.5 20 28.5 22.5 24L28.5 14.5M28.5 14.5H22.5M28.5 14.5V20.5"
          stroke={`url(#${gradId}-saffron)`}
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Full Logo: Icon Badge + Plus Jakarta Sans Wordmark + Accent Spark
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Mark */}
      <svg
        width={currentScale.iconSize}
        height={currentScale.iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${gradId}-full-bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={blueGradientStart} />
            <stop offset="100%" stopColor={blueGradientEnd} />
          </linearGradient>
          <linearGradient id={`${gradId}-full-saffron`} x1="16" y1="30" x2="30" y2="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={saffronColor} />
            <stop offset="100%" stopColor={saffronGradEnd} />
          </linearGradient>
        </defs>

        <rect width="40" height="40" rx="10.5" fill={`url(#${gradId}-full-bg)`} />
        <rect x="9.5" y="9" width="4.8" height="22" rx="2.4" fill={rLetterColor} />
        <path
          d="M11.5 11.5H20.5C24.366 11.5 27.5 14.4101 27.5 18C27.5 21.5899 24.366 24.5 20.5 24.5H11.5"
          stroke={rLetterColor}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.5 30.5C18 30.5 20 28.5 22.5 24L28.5 14.5M28.5 14.5H22.5M28.5 14.5V20.5"
          stroke={`url(#${gradId}-full-saffron)`}
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Styled Wordmark */}
      <span
        className="font-sans font-extrabold tracking-tight flex items-baseline"
        style={{ fontSize: `${currentScale.height * 0.65}px`, lineHeight: 1 }}
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
