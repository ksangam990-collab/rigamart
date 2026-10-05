/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Neutral Scale (Section 5.3 & 6.6)
        n: {
          0: '#FFFFFF',
          25: '#FAFAFA',
          50: '#F5F5F5',
          100: '#EDEDED',
          200: '#E5E5E5',
          300: '#D4D4D4',
          500: '#737373',
          700: '#404040',
          900: '#0A0A0A'
        },
        // Semantic Surfaces & Typography
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        line: 'var(--color-line)',
        // Logo-Led Brand Scale
        brand: {
          50: 'var(--brand-50)',
          100: 'var(--brand-100)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
          DEFAULT: 'var(--color-brand)',
          dark: 'var(--color-brand-dark)',
          soft: 'var(--color-brand-soft)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          soft: 'var(--color-accent-soft)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          soft: 'var(--color-success-soft)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          soft: 'var(--color-warning-soft)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          soft: 'var(--color-danger-soft)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
        card: '0px',
        sheet: '12px'
      },
      boxShadow: {
        overlay: '0 12px 32px rgb(0 0 0 / .12)',
        card: 'none',
        subtle: 'none',
        elevation: '0 12px 32px rgb(0 0 0 / .12)'
      },
      maxWidth: {
        page: '1320px'
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(.2,.8,.2,1)'
      }
    },
  },
  plugins: [],
}
