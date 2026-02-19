export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00ff4c',
          50: '#e6fff0',
          100: '#b3ffd1',
          500: '#00ff4c',
          600: '#00e644',
          700: '#00cc3e',
        },
        accent: '#00ff4c',
        neon: '#00ff4c',
        'background-light': '#f6f8f7',
        'background-dark': '#07281b',
        'surface-dark': '#0d3b2c',
        'surface-dark-lighter': '#0a2f22',
        'surface-darker': '#061713',
        'neutral-dark': '#8faeb0',
        danger: '#ef4444',
        warning: '#f59e0b',
        'alert-red': '#ef4444',
        'alert-bg': 'rgba(239, 68, 68, 0.1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #00e644 0%, #00ff4c 50%, #00cc3e 100%)',
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
