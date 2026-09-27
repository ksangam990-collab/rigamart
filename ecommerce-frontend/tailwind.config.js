/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb', // Royal Blue
          600: '#1d4ed8', // Dark Royal Blue
          700: '#1e40af', // Deep Trust Navy
          primary: '#2563eb',
          secondary: '#ff7a00', // Saffron Accent
          accent: '#ff7a00',    // Indian Saffron / Warm Coral
          saffron: {
            DEFAULT: '#ff7a00',
            light: '#fff7ed',
            hover: '#ea580c',
            dark: '#c2410c'
          }
        }
      }
    },
  },
  plugins: [],
}
