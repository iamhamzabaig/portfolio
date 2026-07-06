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
        // Self-hosted Inter Variable is the primary typeface (loaded in main.jsx);
        // the system stack stays as a fallback until the font is ready.
        sans: [
          '"Inter Variable"',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif'
        ],
        display: [
          '"Inter Variable"',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif'
        ],
        mono: ['ui-monospace', 'SFMono-Regular', '"SF Mono"', 'Menlo', 'monospace']
      },
      letterSpacing: {
        eyebrow: '0.02em'
      },
      // Fluid type ramp — headlines scale continuously with the viewport via
      // clamp() (no breakpoint snaps), the way Apple's type is set. Each step
      // carries its own line-height and negative tracking that tightens as the
      // size grows, so headings stay consistent wherever they're used.
      fontSize: {
        'fluid-hero': ['clamp(3.25rem, 2.4rem + 3.4vw, 5.5rem)', { lineHeight: '1.03', letterSpacing: '-0.03em' }],
        'fluid-h1': ['clamp(3rem, 2.7rem + 1.15vw, 3.75rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'fluid-cta': ['clamp(2.25rem, 1.7rem + 2.25vw, 3.75rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'fluid-h2': ['clamp(2.25rem, 1.95rem + 1.15vw, 3rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'fluid-stat': ['clamp(3.25rem, 2.8rem + 1.9vw, 4.5rem)', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'fluid-h3': ['clamp(1.5rem, 1.35rem + 0.6vw, 1.875rem)', { lineHeight: '1.15', letterSpacing: '-0.015em' }]
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
