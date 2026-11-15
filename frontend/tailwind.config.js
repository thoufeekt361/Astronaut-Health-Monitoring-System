/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          bg: '#07111F',
          card: '#0D1B2E',
          cardHover: '#132640',
          secondary: '#101D30',
          border: 'rgba(56, 189, 248, 0.15)',
          borderHover: 'rgba(56, 189, 248, 0.35)',
          primary: '#38BDF8',
          cyan: '#06B6D4',
          accent: '#818CF8',
          purple: '#A855F7',
          success: '#22C55E',
          warning: '#F59E0B',
          critical: '#EF4444',
          muted: '#94A3B8',
          light: '#F8FAFC',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px -3px rgba(56, 189, 248, 0.35)',
        'glow-critical': '0 0 20px -3px rgba(239, 68, 68, 0.45)',
        'glow-warning': '0 0 20px -3px rgba(245, 158, 11, 0.4)',
        'glow-success': '0 0 20px -3px rgba(34, 197, 94, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
