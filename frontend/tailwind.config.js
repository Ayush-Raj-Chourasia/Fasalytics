export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eaf9f0',
          100: '#c8f3db',
          500: '#0fbf75',
          600: '#0aa56f',
          700: '#008f5a',
        },
        accent: '#00D28A',
        neutral: {
          900: '#0F1724',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg,#0fbf75 0%, #0aa56f 50%, #008f5a 100%)',
      },
      boxShadow: {
        soft: '0 6px 20px rgba(2,6,23,0.12)',
        elevated: '0 24px 60px rgba(2,6,23,0.18)',
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
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
