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
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        line: 'var(--color-line)',
        brand: {
          DEFAULT: 'var(--color-brand)',
          dark: 'var(--color-brand-dark)',
          soft: 'var(--color-brand-soft)',
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          primary: 'var(--color-brand)',
          secondary: '#ff7a00',
          accent: '#ff7a00',
          saffron: {
            DEFAULT: '#ff7a00',
            light: '#fff7ed',
            hover: '#ea580c',
            dark: '#c2410c'
          }
        },
        accent: 'var(--color-accent)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)'
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        sheet: '20px'
      },
      boxShadow: {
        card: '0 1px 2px rgb(20 22 26 / .04), 0 8px 24px rgb(20 22 26 / .06)',
        subtle: '0 1px 2px rgb(20 22 26 / .04)',
        elevation: '0 8px 24px rgb(20 22 26 / .08)'
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(.2,.8,.2,1)'
      }
    },
  },
  plugins: [],
}
