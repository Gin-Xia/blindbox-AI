/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        popmart: {
          pink: '#FF6B9D',
          purple: '#7B2FBE',
          gold: '#FFD700',
          cyan: '#00D4FF',
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px #FF6B9D, 0 0 10px #FF6B9D' },
          '50%': { boxShadow: '0 0 20px #FF6B9D, 0 0 40px #FF6B9D' },
        },
      },
    },
  },
  plugins: [],
}
