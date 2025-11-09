import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 360° РАБОТА Premium Dark Theme
        background: '#000000',
        foreground: '#E8E8ED',
        'foreground-secondary': '#98989F',
        'foreground-muted': '#68686F',

        primary: {
          DEFAULT: '#E8E8ED', // Platinum Silver
          foreground: '#000000',
        },

        border: '#2C2C2E',
        'border-hover': '#3A3A3C',

        card: {
          DEFAULT: 'rgba(28, 28, 30, 0.7)',
          hover: 'rgba(44, 44, 46, 0.7)',
        },

        success: '#30D158',
        warning: '#FFD60A',
        error: '#FF453A',
        info: '#64D2FF',

        // Glass effect colors
        'glass-light': 'rgba(255, 255, 255, 0.05)',
        'glass-medium': 'rgba(255, 255, 255, 0.1)',
        'glass-strong': 'rgba(255, 255, 255, 0.15)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #E8E8ED 0%, #C7C7CC 100%)',
        'gradient-dark': 'linear-gradient(180deg, #000000 0%, #1C1C1E 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'display-sm': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 20px rgba(232, 232, 237, 0.15)',
      },
      backdropBlur: {
        'glass': '10px',
      },
    },
  },
  plugins: [],
};

export default config;
