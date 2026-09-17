import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'exercise-figure.svg', 'sounds/*.wav'],
      manifest: {
        name: '30 дней тренировок',
        short_name: '30 дней',
        description: 'Простые 30-дневные программы тренировок, доступные офлайн.',
        lang: 'ru',
        theme_color: '#10130f',
        background_color: '#f3f2ec',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,wav,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true
      }
    })
  ]
})
