import { Router } from 'express'
import * as authController from '../controllers/auth'
// import authMiddleware from '../middleware/authMiddleware'

const router = Router()

router.post('/login', authController.login)
router.get('/tokenVerify', authController.tokenVerify)
router.post('/logout', authController.logout)

export default router
