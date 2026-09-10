/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme base
        dark: {
          900: '#0F172A',   // main bg
          800: '#1E293B',   // card bg
          700: '#334155',   // elevated card
          600: '#475569',   // borders/dividers
          500: '#64748B',   // muted text
        },
        // Electric blue accent
        electric: {
          DEFAULT: '#38BDF8',
          light: '#7DD3FC',
          dark: '#0EA5E9',
          glow: '#0284C7',
        },
        // Keep JNTUA branding
        jntua: {
          navy: '#0f2851',
          dark: '#0a1d3b',
          blue: '#1e3a8a',
          lightBlue: '#38BDF8',
          gold: '#d97706',
          amber: '#f59e0b',
          maroon: '#831843',
          border: '#334155',
          bg: '#0F172A',
          text: '#F8FAFC',
          muted: '#94A3B8'
        }
      },
      backgroundImage: {
        'glow-blue': 'radial-gradient(ellipse at center, rgba(56,189,248,0.15) 0%, transparent 70%)',
        'glow-blue-sm': 'radial-gradient(ellipse at center, rgba(56,189,248,0.08) 0%, transparent 50%)',
        'dark-gradient': 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(56,189,248,0.3)',
        'glow-sm': '0 0 10px rgba(56,189,248,0.2)',
        'glow-lg': '0 0 40px rgba(56,189,248,0.25)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease',
        'fade-in': 'fade-in 0.3s ease',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(56,189,248,0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(56,189,248,0.5)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
