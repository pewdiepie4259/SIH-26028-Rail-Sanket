import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: [
        '**/server/**',
        '**/sih26028-rail-eta/**',
        '**/*.db*',
        '**/*.db-journal*',
        '**/*.db-wal*',
        '**/*.db-shm*',
        '**/scratch*/**',
      ],
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
})