import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@repo/shared', '@repo/xiangqi-core'],
  },
  build: {
    commonjsOptions: {
      // Must keep the default /node_modules/ include (overriding it breaks React CJS interop),
      // and match the workspace packages by realpath (Vite resolves @repo/* symlinks to packages/*/dist).
      include: [/node_modules/, /packages\/(shared|xiangqi-core|engine-client)\/dist/],
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
