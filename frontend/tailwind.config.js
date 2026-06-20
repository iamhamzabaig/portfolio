/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#08090d',
        panel: '#11131a',
        surface: '#171923',
        border: '#2a2d38',
        ink: '#f4f1ea',
        muted: '#a0a3ad',
        accent: '#7c6cf2',
        teal: '#34d3c6',
        amber: '#f3b95f',
        danger: '#fb7185'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif']
      },
      letterSpacing: {
        eyebrow: '0.22em'
      },
      boxShadow: {
        soft: '0 20px 70px rgba(0, 0, 0, 0.28)',
        glow: '0 0 0 1px rgba(124, 108, 242, 0.25), 0 24px 80px rgba(124, 108, 242, 0.12)'
      },
      backgroundImage: {
        'grid-faint':
          'radial-gradient(circle at 1px 1px, rgba(124,108,242,0.10) 1px, transparent 0)'
      }
    }
  },
  plugins: []
};
