import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ebony: '#1a0f00',
        lacquer: '#241505',
        gold: '#d4a843',
        'gold-light': '#f0d080',
        'gold-dim': '#8b6914',
        cream: '#f5e6c8',
        'cream-dim': '#a89880',
        jade: '#4a7c59',
        'red-chinese': '#c44b4b',
        'wood-dark': '#2a1810',
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
