import { Router } from 'express'
import * as cartController from '../controllers/carts'
import authMiddleware from '../middleware/authMiddleware'

const router = Router()
router.post('/create', authMiddleware, cartController.createCart)
router.get('/get', authMiddleware, cartController.getCart)
router.put('/update', authMiddleware, cartController.updateCart)
router.delete('/delete', authMiddleware, cartController.deleteCart)

export default router
