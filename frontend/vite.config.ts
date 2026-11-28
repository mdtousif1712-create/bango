import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

const ALL_ROUTES = [
  'map',
  'assistant',
  'trending',
  'domains',
  'domain-detail',
  'friends',
  'saved',
  'bango-ai',
  'healthcare',
  'transportation',
  'tourism',
  'shopping',
  'education',
  'entertainment',
  'restaurants',
  'startups',
]

const DOMAIN_SLUGS = [
  'healthcare',
  'transportation',
  'tourism',
  'shopping',
  'education',
  'entertainment',
  'restaurants',
  'startups',
]

// Plugin to pre-render static HTML route files so Vercel can serve any SPA route without 404
function generateStaticRoutes() {
  return {
    name: 'generate-static-routes',
    closeBundle() {
      try {
        const distDir = fileURLToPath(new URL('./dist', import.meta.url))
        const indexPath = path.join(distDir, 'index.html')
        if (!fs.existsSync(indexPath)) return
        const indexHtml = fs.readFileSync(indexPath, 'utf-8')

        // 1. Create 404.html fallback
        fs.writeFileSync(path.join(distDir, '404.html'), indexHtml)

        // 2. Create static files and directories for all known routes
        for (const route of ALL_ROUTES) {
          // dist/route.html
          fs.writeFileSync(path.join(distDir, `${route}.html`), indexHtml)
          // dist/route/index.html
          const subDir = path.join(distDir, route)
          fs.mkdirSync(subDir, { recursive: true })
          fs.writeFileSync(path.join(subDir, 'index.html'), indexHtml)
        }

        // 3. Create domain subroutes: domains/healthcare, domain/healthcare, etc.
        for (const slug of DOMAIN_SLUGS) {
          const d1 = path.join(distDir, 'domains', slug)
          fs.mkdirSync(d1, { recursive: true })
          fs.writeFileSync(path.join(d1, 'index.html'), indexHtml)

          const d2 = path.join(distDir, 'domain', slug)
          fs.mkdirSync(d2, { recursive: true })
          fs.writeFileSync(path.join(d2, 'index.html'), indexHtml)
        }

        console.log('✓ Successfully pre-rendered static SPA route files for Vercel')
      } catch (err) {
        console.warn('Could not generate static route files:', err)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), generateStaticRoutes()],
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
