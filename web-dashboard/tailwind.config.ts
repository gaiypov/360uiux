import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Revolut Ultra Design System
        'ultra-black': '#000000',
        'graphite': '#1C1C1E',
        'dark-gray': '#2C2C2E',
        'neon-purple': '#8E7FFF',
        'cyber-blue': '#39E0F8',
        'success-green': '#30D158',
        'warning-orange': '#FF9F0A',
        'error-red': '#FF453A',
        'text-primary': '#FFFFFF',
        'text-secondary': '#98989D',

        // Semantic colors
        background: {
          DEFAULT: '#000000',
          secondary: '#1C1C1E',
          elevated: '#2C2C2E',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.12)',
          subtle: 'rgba(255, 255, 255, 0.08)',
        },
        foreground: {
          DEFAULT: '#FFFFFF',
          secondary: '#98989D',
          muted: '#6E6E73',
        },
        primary: {
          DEFAULT: '#8E7FFF',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#39E0F8',
          foreground: '#000000',
        },
        success: '#30D158',
        warning: '#FF9F0A',
        destructive: '#FF453A',

        // Glass morphism
        glass: {
          bg: 'rgba(255, 255, 255, 0.08)',
          border: 'rgba(255, 255, 255, 0.12)',
          hover: 'rgba(255, 255, 255, 0.12)',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8E7FFF 0%, #39E0F8 100%)',
        'gradient-neon': 'linear-gradient(135deg, #8E7FFF 0%, #39E0F8 100%)',
        'gradient-metal': 'linear-gradient(135deg, #E5E5EA 0%, #98989D 100%)',
      },
      borderRadius: {
        'xl': '20px',
        'lg': '16px',
        'md': '12px',
        'sm': '8px',
      },
      fontSize: {
        'display-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.5px', fontWeight: '700' }],
        'display-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.3px', fontWeight: '600' }],
        'display-sm': ['20px', { lineHeight: '28px', letterSpacing: '-0.2px', fontWeight: '600' }],
        'number-display': ['48px', { lineHeight: '56px', fontWeight: '700' }],
        'number-lg': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'number-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
      },
      spacing: {
        '4.5': '18px',
        '18': '72px',
        '22': '88px',
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.2)',
        'neon': '0 0 20px rgba(142, 127, 255, 0.3), 0 0 40px rgba(57, 224, 248, 0.2)',
        'neon-sm': '0 0 10px rgba(142, 127, 255, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(142, 127, 255, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(57, 224, 248, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
