/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Ported 1:1 from the original light/dark theme tokens
        accent: {
          DEFAULT: '#3498db', // rgb(52, 152, 219)
          hover: '#3088c2', // rgb(48, 136, 194)
        },
        ink: '#161616', // rgb(22, 22, 22)
        graphite: '#535353', // rgb(83, 83, 83)
        paper: '#f6f6f6', // rgb(246, 246, 246)
        night: '#2c2c31', // rgb(44, 44, 49)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { color: 'var(--accent)' },
          '50%': { color: 'var(--accent-2)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 3s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
      },
    },
  },
  plugins: [],
}
