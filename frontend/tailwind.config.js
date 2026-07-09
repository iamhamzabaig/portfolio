import typography from '@tailwindcss/typography';

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
        'on-accent': 'rgb(var(--on-accent) / <alpha-value>)', // text/icon on an accent fill
        // Semantic status roles — channel-based like the theme tokens, so they shift
        // between light/dark and support the /alpha modifier (bg-success/10, …).
        success: 'rgb(var(--success) / <alpha-value>)', // Apple green
        danger: 'rgb(var(--danger) / <alpha-value>)', // Apple red
        warning: 'rgb(var(--warning) / <alpha-value>)', // Apple orange
        info: 'rgb(var(--info) / <alpha-value>)' // Apple blue
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
        'fluid-hero': ['clamp(2.5rem, 1.95rem + 2.2vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'fluid-h1': ['clamp(2.25rem, 2rem + 0.9vw, 3rem)', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'fluid-cta': ['clamp(2rem, 1.6rem + 1.6vw, 3rem)', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'fluid-h2': ['clamp(1.75rem, 1.55rem + 0.85vw, 2.375rem)', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
        'fluid-stat': ['clamp(2.5rem, 2.15rem + 1.4vw, 3.5rem)', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'fluid-h3': ['clamp(1.375rem, 1.25rem + 0.45vw, 1.625rem)', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        // Body & UI scale — the tier below headlines. Every role that was being set
        // with one-off arbitrary px (text-[15px], text-[13px], …) now has a named
        // token with a paired line-height, so the same role reads the same size
        // everywhere. Pair with text-muted/text-ink for color; these carry size only.
        'body-lg': ['1.125rem', { lineHeight: '1.7' }], // 18px — lead paragraphs, intros
        body: ['1.0625rem', { lineHeight: '1.65' }], // 17px — standard prose
        'body-sm': ['0.9375rem', { lineHeight: '1.6' }], // 15px — controls, card copy, secondary
        caption: ['0.8125rem', { lineHeight: '1.5' }], // 13px — labels, meta, footnotes
        micro: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.06em' }], // 11px — uppercase eyebrows/tags
        eyebrow: ['0.9375rem', { lineHeight: '1.4', letterSpacing: '0.01em' }] // 15px — colored section label
      },
      // Radius roles — a semantic name per surface type so corners stay consistent
      // regardless of which element renders them. Physical Tailwind steps (lg/xl/2xl…)
      // remain available; these name the *intent*.
      borderRadius: {
        control: '0.375rem', // inputs, small controls
        card: '0.5rem', // cards, panels, feature tiles
        media: '0.5rem' // images, video, large thumbnails — match cards
      },
      boxShadow: {
        // Elevation ladder — Apple's shadows are diffuse and low-contrast; they hint
        // at elevation rather than announce it. glow (focus) → soft (resting card) →
        // lift (hover/pulled-forward) → overlay (modals, toasts, popovers).
        soft: '0 4px 24px rgba(0, 0, 0, 0.06)',
        lift: '0 18px 48px rgba(0, 0, 0, 0.12)',
        overlay: '0 24px 64px rgba(0, 0, 0, 0.18)',
        glow: '0 0 0 4px rgb(var(--accent) / 0.15)'
      },
      transitionTimingFunction: {
        // Apple's signature ease — a soft, confident deceleration.
        apple: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
  },
  plugins: [typography]
};
