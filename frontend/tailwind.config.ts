import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050816',
        bgAlt: '#0A1020',
        primary: '#00D4FF',
        secondary: '#3B82F6',
        success: '#10B981',
        danger: '#EF4444',
        muted: '#94A3B8'
      },
      boxShadow: {
        glow: '0 0 30px rgba(0, 212, 255, 0.18)',
        glass: '0 24px 80px rgba(0, 0, 0, 0.38)'
      },
      backgroundImage: {
        'hero-radial': 'radial-gradient(circle at top, rgba(0, 212, 255, 0.16), transparent 34%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.12), transparent 24%), linear-gradient(180deg, #050816 0%, #0A1020 100%)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(0, 212, 255, 0)' },
          '50%': { boxShadow: '0 0 28px rgba(0, 212, 255, 0.22)' }
        },
        sweep: {
          '0%': { transform: 'translateX(-100%) skewX(-16deg)' },
          '100%': { transform: 'translateX(100%) skewX(-16deg)' }
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' }
        }
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.6s ease-in-out infinite',
        sweep: 'sweep 7s linear infinite',
        blink: 'blink 1s steps(1, end) infinite'
      }
    }
  },
  plugins: []
};

export default config;
