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
        background: {
          DEFAULT: '#0A0A0F',
          secondary: '#121218',
          elevated: '#1A1A23',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
        },
        foreground: {
          DEFAULT: '#FAFAFA',
          secondary: '#C8C8D0',
          muted: '#888895',
        },
        primary: {
          DEFAULT: '#8E7FFF',
        },
        secondary: {
          DEFAULT: '#39E0F8',
        },
        success: '#10B981',
        warning: '#F59E0B',
        destructive: '#EF4444',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8E7FFF, #39E0F8)',
      },
      borderRadius: {
        'xl': '20px',
        'lg': '16px',
        'md': '12px',
        'sm': '8px',
      },
      fontSize: {
        'display-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.5px' }],
        'display-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.3px' }],
        'display-sm': ['20px', { lineHeight: '28px', letterSpacing: '-0.2px' }],
        'number-display': ['48px', { lineHeight: '56px' }],
        'number-lg': ['32px', { lineHeight: '40px' }],
        'number-md': ['24px', { lineHeight: '32px' }],
      },
      spacing: {
        '4.5': '18px',
        '18': '72px',
        '22': '88px',
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
export default config
