/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jntua: {
          navy: '#0f2851',
          dark: '#0a1d3b',
          blue: '#1e3a8a',
          lightBlue: '#3b82f6',
          gold: '#d97706',
          amber: '#f59e0b',
          maroon: '#831843',
          border: '#e2e8f0',
          bg: '#f8fafc',
          text: '#0f172a',
          muted: '#64748b'
        }
      }
    },
  },
  plugins: [],
}
