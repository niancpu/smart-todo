/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        glass: {
          white: 'rgba(255, 255, 255, 0.55)',
          heavy: 'rgba(255, 255, 255, 0.72)',
          light: 'rgba(255, 255, 255, 0.35)',
          border: 'rgba(255, 255, 255, 0.25)',
          'border-strong': 'rgba(255, 255, 255, 0.40)',
        },
        accent: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
          glow: 'rgba(59, 130, 246, 0.25)',
        },
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.60)',
          hover: 'rgba(255, 255, 255, 0.75)',
          active: 'rgba(59, 130, 246, 0.12)',
        },
      },
      backdropBlur: {
        glass: '20px',
        'glass-heavy': '32px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        glow: '0 0 24px rgba(59, 130, 246, 0.2)',
      },
      animation: {
        'blob': 'blob 20s infinite alternate',
        'blob-reverse': 'blob-reverse 25s infinite alternate',
        'blob-slow': 'blob-slow 30s infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'splash-logo': 'splashLogo 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'splash-fade': 'splashFade 0.5s ease-in forwards 1.2s',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(60px, -40px) scale(1.15)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.9)' },
          '100%': { transform: 'translate(40px, 20px) scale(1.05)' },
        },
        'blob-reverse': {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-50px, 50px) scale(1.1)' },
          '66%': { transform: 'translate(40px, -20px) scale(0.95)' },
          '100%': { transform: 'translate(-20px, -40px) scale(1.08)' },
        },
        'blob-slow': {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(30px, 60px) scale(1.12)' },
          '100%': { transform: 'translate(-40px, -30px) scale(0.92)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        splashLogo: {
          from: { opacity: '0', transform: 'scale(0.7)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        splashFade: {
          from: { opacity: '1' },
          to: { opacity: '0', visibility: 'hidden' },
        },
      },
    },
  },
  plugins: [],
}
