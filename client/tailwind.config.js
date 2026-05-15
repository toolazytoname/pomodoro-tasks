/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f1a',
        surface: '#1a1a2e',
        border: 'rgba(255,255,255,0.08)',
        primary: '#6366f1',
        accent: '#22d3ee',
        q1: '#ef4444',
        q2: '#f59e0b',
        q3: '#3b82f6',
        q4: '#6b7280',
      },
    },
  },
  plugins: [],
}
