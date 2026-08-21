import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@repo/shared', '@repo/xiangqi-core'],
  },
  build: {
    commonjsOptions: {
      include: [/@repo\/shared/, /@repo\/xiangqi-core/],
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:3000', changeOrigin: true },
    },
  },
});
