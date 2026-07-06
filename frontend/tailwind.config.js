/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme-aware tokens — channels defined per theme in styles/index.css
        // (:root = light, .dark = dark). rgb(var / <alpha>) keeps Tailwind's
        // /opacity modifiers (bg-accent/10, border-accent/30, …) working.
        bg: 'rgb(var(--bg) / <alpha-value>)',
        panel: 'rgb(var(--panel) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        success: '#34c759', // Apple green
        danger: '#ff3b30', // Apple red
        // Retained for the (out-of-scope) admin surfaces that still reference them.
        teal: '#34d3c6',
        amber: '#f3b95f'
      },
      fontFamily: {
        // Apple's own system stack renders SF Pro on Apple hardware; Inter is the
        // near-identical fallback everywhere else.
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          'Inter',
          'system-ui',
          'sans-serif'
        ],
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          'Inter',
          'system-ui',
          'sans-serif'
        ],
        mono: ['ui-monospace', 'SFMono-Regular', '"SF Mono"', 'Menlo', 'monospace']
      },
      letterSpacing: {
        eyebrow: '0.02em'
      },
      borderRadius: {
        '4xl': '1.75rem',
        '5xl': '2.25rem'
      },
      boxShadow: {
        // Apple's shadows are diffuse and low-contrast — they hint at elevation
        // rather than announce it.
        soft: '0 4px 24px rgba(0, 0, 0, 0.06)',
        lift: '0 18px 48px rgba(0, 0, 0, 0.12)',
        glow: '0 0 0 4px rgb(var(--accent) / 0.15)'
      },
      transitionTimingFunction: {
        // Apple's signature ease — a soft, confident deceleration.
        apple: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
  },
  plugins: []
};
