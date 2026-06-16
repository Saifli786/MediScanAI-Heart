import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        primary: {
          DEFAULT: '#0284c7',
          light: '#38bdf8',
          dark: '#0369a1',
          50: '#f0f9ff',
          100: '#e0f2fe',
        },
        secondary: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        text: {
          DEFAULT: '#0f172a',
          muted: '#64748b',
          light: '#94a3b8',
        }
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(14, 165, 233, 0.1)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        soft: '0 10px 40px -10px rgba(2, 132, 199, 0.15)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseSoft: 'pulseSoft 3s ease-in-out infinite',
        slideUp: 'slideUp 0.6s ease-out forwards'
      }
    }
  },
  plugins: []
};

export default config;
