import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // The app asks before updating rather than swapping itself out: a business can be halfway
      // through typing an invoice, and reloading under them to save one click isn't a trade
      // worth making. `PwaUpdater` shows the prompt.
      registerType: 'prompt',
      includeAssets: ['img/web/favicon.ico', 'img/web/apple-touch-icon.png', 'fonts/*.ttf'],
      manifest: {
        name: 'FinanCareLite',
        short_name: 'FinanCareLite',
        description: 'Fatura, klientë dhe produkte — lokalisht, pa nevojë për server.',
        lang: 'sq',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        icons: [
          { src: '/img/web/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/img/web/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/img/web/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Everything is precached, the PDF renderer and its worker included — an invoicing app
        // that only half-works offline would be worse than one that doesn't claim to. It all
        // downloads in the background once the page is interactive, so the first visit isn't
        // slowed down; the per-route splitting is what keeps that first visit small.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf,woff,woff2,mjs}'],
        // ExcelJS is the one exception, and it's nearly a megabyte: exporting a spreadsheet is
        // not what anyone opens this app to do on a bad connection, and it still works offline
        // once it has been used once.
        globIgnores: ['**/exceljs*.js'],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/exceljs.*\.js$/,
            handler: 'CacheFirst',
            options: { cacheName: 'financarelite-exceljs', expiration: { maxEntries: 2 } },
          },
        ],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        // Every route is served by the same SPA shell, so an offline reload while parked on
        // /faturat resolves to index.html instead of the browser's error page.
        navigateFallback: '/index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
  },
});
