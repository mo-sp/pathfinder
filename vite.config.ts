/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  // Dev-only: forward /api to the live feedback endpoint so the opt-in card
  // is testable over HMR. Same-origin from the browser's view (no CORS), and
  // the Origin header is rewritten to the value the endpoint allow-lists.
  // Has no effect on the production build.
  server: {
    proxy: {
      '/api': {
        target: 'https://pathfinder-berufetest.de',
        changeOrigin: true,
        headers: { origin: 'https://pathfinder-berufetest.de' },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@data': fileURLToPath(new URL('./src/data', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // The feedback endpoint lives outside src/ but is the only server-side
    // surface the project exposes, so its tests run here too.
    include: ['src/**/*.test.ts', 'server/**/*.test.mjs'],
    // Layer 4 pushes onet-occupations.json past 7 MB (skills + abilities
    // + knowledge per occupation). Dynamic-import + parse at test time is
    // proportionally slower, so bump the per-test timeout to give the
    // integration tests that call loadOccupations() comfortable headroom.
    testTimeout: 15_000,
  },
})
