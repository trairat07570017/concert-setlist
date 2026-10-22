/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        stage: {
          bg: '#0a0a0c',
          card: '#141418',
          border: '#27272a',
          text: '#f4f4f5',
          accent: '#e11d48',
          gold: '#eab308'
        }
      }
    },
  },
  plugins: [],
}
