import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Toutes les valeurs proviennent des variables CSS definies dans globals.css
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          soft: 'rgb(var(--color-accent-soft) / <alpha-value>)',
        },
        gold: 'rgb(var(--color-gold) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '1.25rem',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(20 32 58 / 0.04), 0 8px 24px -12px rgb(20 32 58 / 0.12)',
        lift: '0 2px 4px rgb(20 32 58 / 0.05), 0 18px 40px -18px rgb(20 32 58 / 0.22)',
      },
      maxWidth: { shell: '1200px' },
    },
  },
  plugins: [],
}
export default config
