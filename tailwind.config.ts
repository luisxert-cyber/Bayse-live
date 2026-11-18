import type { Config } from 'tailwindcss';

// BAYSE design tokens. Colours are CSS variables (see app/globals.css) so the
// same classes work in light and dark themes.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        stone: 'rgb(var(--stone) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-ink': 'rgb(var(--accent-ink) / <alpha-value>)',
        sage: 'rgb(var(--sage) / <alpha-value>)',
        ochre: 'rgb(var(--ochre) / <alpha-value>)',
        clay: 'rgb(var(--clay) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['20px', '28px'],
        xl: ['28px', '34px'],
        '2xl': ['40px', '44px'],
      },
      borderRadius: { card: '20px', pill: '999px' },
      boxShadow: { card: '0 1px 2px rgb(31 28 25 / 0.04), 0 8px 24px rgb(31 28 25 / 0.06)' },
      transitionDuration: { DEFAULT: '200ms' },
      minHeight: { tap: '44px' },
    },
  },
  plugins: [],
};
export default config;
