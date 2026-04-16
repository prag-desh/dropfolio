/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-terminal': '#0d0d0d',
        'bg-surface': '#111111',
        'border-terminal': '#1a1a1a',
        'matrix-green': '#00ff41',
        'terminal-cyan': '#00d4ff',
        'terminal-amber': '#ffb800',
        'terminal-red': '#ff4444',
        'text-terminal': '#e0e0e0',
        'text-muted': '#555555',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'scanlines': 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)',
      },
      boxShadow: {
        'matrix-glow': '0 0 8px rgba(0, 255, 65, 0.4)',
        'terminal-glow': '0 0 12px rgba(0, 255, 65, 0.2)',
      },
      textShadow: {
        'matrix': '0 0 8px rgba(0, 255, 65, 0.4)',
      },
      animation: {
        'blink': 'blink 1s infinite',
        'typewriter': 'typewriter 2s steps(40, end)',
        'fade-in': 'fade-in 0.5s ease-in',
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        typewriter: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
