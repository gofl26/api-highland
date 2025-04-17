import fs from 'fs'
import path from 'path'
import express, { Router } from 'express'

export async function loadRoutes(app: express.Application) {
  const routesPath = path.join(__dirname, 'routes')
  const files = fs.readdirSync(routesPath)

  for (const file of files) {
    const fullPath = path.join(routesPath, file)

    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const route = await import(fullPath) // ✅ dynamic import

      const router: Router = route.default || route
      if (router && typeof router === 'function') {
        const routeName = '/' + file.replace(/\.(ts|js)$/, '')
        app.use(`/api${routeName}`, express.urlencoded({ extended: true }), router)
      }
    }
  }
}
