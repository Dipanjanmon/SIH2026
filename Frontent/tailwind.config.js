/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          500: '#1b4d89',
          700: '#10335e',
          800: '#0b213f',
          900: '#061224'
        },
        risk: {
          low: '#16a34a',
          medium: '#ca8a04',
          high: '#ea580c',
          critical: '#dc2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}