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
        // "serif" is kept as the display style name; it uses Montserrat bold like the brand.
        serif: ['var(--font-display)', '"Arial Narrow"', 'Arial', 'sans-serif'],
        display: ['var(--font-display)', '"Arial Narrow"', 'Arial', 'sans-serif'],
        sans: ['var(--font-body)', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['20px', '28px'],
        xl: ['28px', '34px'],
        '2xl': ['40px', '44px'],
      },
      // Studio brand: square edges everywhere except true circles (avatars, dots) and small pills.
      borderRadius: { none: '0px', sm: '0px', DEFAULT: '0px', md: '0px', lg: '0px', xl: '0px', '2xl': '0px', '3xl': '0px', card: '0px', pill: '9999px', full: '9999px' },
      boxShadow: { card: 'none' },
      transitionDuration: { DEFAULT: '200ms' },
      minHeight: { tap: '44px' },
    },
  },
  plugins: [],
};
export default config;
