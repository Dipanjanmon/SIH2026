/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          500: '#1b4d89',
          700: '#10335e',
          800: '#0b213f',
          900: '#061224',
        },
        risk: {
          low: '#16a34a',
          medium: '#ca8a04',
          high: '#ea580c',
          critical: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseRed: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        growUp: {
          '0%': { height: '0' },
          '100%': { height: '100%' },
        },
        shimmerMove: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'marquee-40s': 'marquee 40s linear infinite',
        'pulse-critical': 'pulseRed 1.4s ease-in-out infinite',
        'pulse-high': 'pulseRed 2s ease-in-out infinite',
        'bar-anim': 'growUp 0.8s ease-out forwards',
        shimmer: 'shimmerMove 1.6s infinite',
      },
    },
  },
  plugins: [],
};