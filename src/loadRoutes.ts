import fs from 'fs'
import path from 'path'
import express, { Router } from 'express'

const routesPath = path.join(__dirname, 'routes')

export function loadRoutes(app: express.Application) {
  fs.readdirSync(routesPath).forEach((file) => {
    const fullPath = path.join(routesPath, file)

    // .ts or .js 파일만 로드
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const route = require(fullPath)

      // 라우터가 default export 또는 named export로 되어있는 경우 모두 대응
      const router: Router = route.default || route

      if (router && typeof router === 'function') {
        const routeName = '/' + file.replace(/\.(ts|js)$/, '') // 파일명 → 라우터 경로
        app.use(`/api${routeName}`, express.urlencoded({ extended: true }), router)
      }
    }
  })
}
