export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0fbd74',
          50: '#eaf9f0',
          100: '#c8f3db',
          500: '#0fbd74',
          600: '#0ca665',
          700: '#0a8a54',
        },
        accent: '#00D28A',
        'background-light': '#f6f8f7',
        'background-dark': '#10221a',
        'surface-dark': '#152e24',
        'surface-dark-lighter': '#1c3b2f',
        'surface-darker': '#0c1b14',
        'neutral-dark': '#8faeb0',
        danger: '#ef4444',
        warning: '#f59e0b',
        'alert-red': '#ef4444',
        'alert-bg': 'rgba(239, 68, 68, 0.1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg,#0fbd74 0%, #0ca665 50%, #0a8a54 100%)',
      },
      boxShadow: {
        soft: '0 6px 20px rgba(2,6,23,0.12)',
        elevated: '0 24px 60px rgba(2,6,23,0.18)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '6px',
        md: '12px',
        lg: '1rem',
        xl: '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.42s cubic-bezier(.22,.9,.13,1)',
        'slide-up': 'slideUp 0.42s cubic-bezier(.22,.9,.13,1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    }
  },
  plugins: [],
}
