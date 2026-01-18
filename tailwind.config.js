/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        game: ['Nunito', 'sans-serif'],
      },
      colors: {
        // Warm light theme colors
        cream: {
          50: '#FFFDF7',
          100: '#FFF9E8',
          200: '#FFF3D1',
          300: '#FFE9B0',
          400: '#FFDB82',
          500: '#FFC94D',
          600: '#FFB61A',
          700: '#E69D00',
          800: '#B37A00',
          900: '#805700',
        },
        warm: {
          50: '#FEF7F0',
          100: '#FEEDE0',
          200: '#FCD9BE',
          300: '#F9C093',
          400: '#F5A167',
          500: '#F07D3B',
          600: '#E45A1F',
          700: '#BD4516',
          800: '#973713',
          900: '#7A2F14',
        },
        sage: {
          50: '#F4F7F4',
          100: '#E6EDE6',
          200: '#CDDACD',
          300: '#A8BFA8',
          400: '#7D9D7D',
          500: '#5C7F5C',
          600: '#476547',
          700: '#3A513A',
          800: '#314331',
          900: '#2A382A',
        },
        sky: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        // Game-specific colors
        pixel: {
          ground: '#8B7355',
          grass: '#7CB342',
          grassDark: '#558B2F',
          sky: '#87CEEB',
          skyDark: '#1E3A5F',
          wood: '#A0522D',
          stone: '#808080',
          gold: '#FFD700',
          red: '#E53935',
          blue: '#1E88E5',
        },
        // Surface colors for light/dark mode
        surface: {
          light: '#FFFDF7',
          DEFAULT: '#FEF7F0',
          dark: '#1a1a2e',
        },
        card: {
          light: '#FFFFFF',
          dark: '#252542',
        },
        text: {
          light: '#3D3D3D',
          muted: '#6B7280',
          dark: '#F5F5F5',
        },
      },
      boxShadow: {
        'warm': '0 4px 14px 0 rgba(255, 150, 100, 0.15)',
        'warm-lg': '0 10px 25px -3px rgba(255, 150, 100, 0.2)',
        'pixel': '4px 4px 0px 0px rgba(0,0,0,0.2)',
        'pixel-lg': '6px 6px 0px 0px rgba(0,0,0,0.2)',
        'glow': '0 0 20px rgba(255, 201, 77, 0.5)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pixel-walk': 'pixelWalk 0.4s steps(4) infinite',
        'pixel-idle': 'pixelIdle 1s steps(2) infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'flag-wave': 'flagWave 1s ease-in-out infinite',
        'cloud-drift': 'cloudDrift 20s linear infinite',
        'celebration': 'celebration 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pixelWalk: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '-128px 0' },
        },
        pixelIdle: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '-64px 0' },
        },
        sparkle: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.5, transform: 'scale(1.2)' },
        },
        flagWave: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        cloudDrift: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        celebration: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #FEF7F0 0%, #FFE9B0 100%)',
        'gradient-sky': 'linear-gradient(180deg, #87CEEB 0%, #E0F2FE 100%)',
        'gradient-sunset': 'linear-gradient(180deg, #FFB61A 0%, #F07D3B 50%, #E45A1F 100%)',
        'gradient-game': 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 30%, #98FB98 60%, #8B7355 100%)',
      },
    },
  },
  plugins: [],
}
