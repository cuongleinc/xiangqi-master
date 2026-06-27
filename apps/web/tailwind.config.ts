import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        board: {
          bg: '#f0d9b5',
          line: '#5c4033',
          river: '#2d5a27',
          red: '#cc0000',
          black: '#222222',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
