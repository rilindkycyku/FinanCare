import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // expose on LAN so real mobile devices can connect
    proxy: {
      // Forward all /api requests through Vite to the local backend.
      // This lets mobile devices on the same network reach the API
      // without needing the backend to bind to a LAN IP.
      '/api': {
        target: 'https://localhost:7285',
        changeOrigin: true,
        secure: false, // allow self-signed cert in dev
      },
    },
  },
});