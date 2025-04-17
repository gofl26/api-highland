import express from 'express'
import dotenv from 'dotenv'
import { Pool } from 'pg'
import cors from 'cors'
import logger from './utils/logger'
import fs from 'fs'
import { loadRoutes } from './loadRoutes'
dotenv.config()

const { FILESTORAGE_PATH = '/tmp/highlandStorage' } = process.env

const app = express()
const port = 3001

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const requestMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  // const origin = req.headers.origin;
  // if (allowedOrigins.includes(origin)) {
  //   res.header("Access-Control-Allow-Origin", origin);
  // }
  //로그 생성
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  })
  next()
}

app.use(cors())
app.use(express.json())
app.use(requestMiddleware)

//스토리지 생성
if (!fs.existsSync(FILESTORAGE_PATH)) {
  fs.mkdirSync(FILESTORAGE_PATH, { recursive: true })
  console.log(`Directory created at ${FILESTORAGE_PATH}`)
} else {
  console.log(`Directory already exists at ${FILESTORAGE_PATH}`)
}

app.get('/', async (_req, res) => {
  const result = await pool.query('SELECT NOW()')
  res.json(result.rows[0])
})

loadRoutes(app)

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  void next
  const status = err.status || 500
  const message = err.message || 'Internal server error'
  console.error(`Error: ${message}`)

  res.status(status).json({ error: message })
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
