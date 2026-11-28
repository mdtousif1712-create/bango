import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

// Plugin to duplicate index.html to 404.html for SPA host fallbacks
function copyIndexTo404() {
  return {
    name: 'copy-index-to-404',
    closeBundle() {
      try {
        const distDir = fileURLToPath(new URL('./dist', import.meta.url))
        const indexPath = path.join(distDir, 'index.html')
        const notFoundPath = path.join(distDir, '404.html')
        if (fs.existsSync(indexPath)) {
          fs.copyFileSync(indexPath, notFoundPath)
          console.log('✓ Successfully created dist/404.html for SPA fallback')
        }
      } catch (err) {
        console.warn('Could not copy index.html to 404.html:', err)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), copyIndexTo404()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
})
