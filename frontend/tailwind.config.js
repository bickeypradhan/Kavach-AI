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
        industrial: {
          900: '#0B0F17',
          800: '#111827',
          700: '#1F2937',
          600: '#374151',
          500: '#4B5563',
          accent: '#F59E0B',
          danger: '#EF4444',
          warning: '#F97316',
          success: '#10B981',
          info: '#3B82F6'
        }
      }
    },
  },
  plugins: [],
}
