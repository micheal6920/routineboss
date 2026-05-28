/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        boss: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6e0',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        neon: {
          cyan: '#00fff5',
          purple: '#bf00ff',
          pink: '#ff006e',
          green: '#39ff14',
          orange: '#ff6b00',
          yellow: '#ffff00',
        },
        dark: {
          900: '#050810',
          800: '#0a0f1e',
          700: '#0f1629',
          600: '#141d34',
          500: '#1a2540',
          400: '#1f2d4d',
          300: '#253558',
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-down': 'slide-down 0.4s ease-out',
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        'pulse-neon': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        'slide-up': { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        'slide-down': { '0%': { transform: 'translateY(-20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        'bounce-in': { '0%': { transform: 'scale(0.3)', opacity: '0' }, '50%': { transform: 'scale(1.05)' }, '70%': { transform: 'scale(0.9)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        wiggle: { '0%, 100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glow: { '0%, 100%': { boxShadow: '0 0 20px rgba(0,255,245,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(0,255,245,0.8), 0 0 80px rgba(0,255,245,0.3)' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
