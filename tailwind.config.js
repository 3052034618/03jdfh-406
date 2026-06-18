/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        void: '#0A0A0F',
        surface: '#12121A',
        panel: '#1A1A25',
        border: '#2A2A38',
        amber: {
          DEFAULT: '#D4A04A',
          dim: '#8B6A2F',
          glow: '#F5C842',
        },
        danger: {
          DEFAULT: '#8B2035',
          dim: '#5A1525',
          glow: '#D4304F',
        },
        safe: {
          DEFAULT: '#4A6741',
          dim: '#2E4228',
          glow: '#6AAF5C',
        },
        warn: {
          DEFAULT: '#B8860B',
          dim: '#7A5A08',
          glow: '#E8A825',
        },
        muted: '#6B6B80',
        fg: '#E8E8F0',
        fgdim: '#9999AA',
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'flicker': 'flicker 0.15s infinite',
        'scanline': 'scanline 8s linear infinite',
        'signal': 'signal 1.5s ease-in-out infinite',
        'noise-shift': 'noiseShift 0.1s steps(3) infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        flicker: {
          '0%': { opacity: '0.97' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.98' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        signal: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        noiseShift: {
          '0%': { backgroundPosition: '0 0' },
          '33%': { backgroundPosition: '100px -50px' },
          '66%': { backgroundPosition: '-50px 100px' },
          '100%': { backgroundPosition: '0 0' },
        },
      },
    },
  },
  plugins: [],
};
