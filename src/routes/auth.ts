import { Router } from 'express'
import * as authController from '../controllers/auth'
// import authMiddleware from '../middleware/authMiddleware'

const router = Router()

router.post('/login', authController.login)

export default router
