import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'img/web/favicon.ico', 'img/web/apple-touch-icon.png'],
      devOptions: {
        enabled: true,
        type: 'module',
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MiB — bundle is ~4.8 MB
      },
      manifest: {
        short_name: "FinanCare",
        name: "FinanCare - More than Finance",
        icons: [
          {
            src: "/img/web/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/img/web/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        start_url: ".",
        display: "standalone",
        theme_color: "#000000",
        background_color: "#ffffff"
      }
    })
  ],
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