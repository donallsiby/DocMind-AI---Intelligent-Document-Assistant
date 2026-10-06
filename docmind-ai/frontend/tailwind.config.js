/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'color-mix(in srgb, var(--background) calc(100% * <alpha-value>), transparent)',
        card: 'color-mix(in srgb, var(--card) calc(100% * <alpha-value>), transparent)',
        border: 'color-mix(in srgb, var(--border) calc(100% * <alpha-value>), transparent)',
        accent: {
          teal: 'color-mix(in srgb, var(--accent-teal) calc(100% * <alpha-value>), transparent)',
          blue: 'color-mix(in srgb, var(--accent-blue) calc(100% * <alpha-value>), transparent)',
        },
        text: {
          primary: 'color-mix(in srgb, var(--text-primary) calc(100% * <alpha-value>), transparent)',
          secondary: 'color-mix(in srgb, var(--text-secondary) calc(100% * <alpha-value>), transparent)',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      borderRadius: {
        'lg': '0.75rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}