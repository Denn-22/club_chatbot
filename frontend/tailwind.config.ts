import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#EEF2E6',
        ink: '#16263D',
        grass: '#0E7A3C',
        card: '#F5B82E',
        whistle: '#D64533',
        chalk: '#FFFFFF',
      },
      fontFamily: {
        display: ['"Archivo Black"', 'system-ui', 'sans-serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        hard: '5px 5px 0 0 #16263D',
        hardSm: '3px 3px 0 0 #16263D',
        hardLg: '8px 8px 0 0 #16263D',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: { '0%,100%': { opacity: '.25' }, '50%': { opacity: '1' } },
      },
      animation: {
        fadeUp: 'fadeUp .4s ease-out both',
        blink: 'blink 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
