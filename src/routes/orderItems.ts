import { Router } from 'express'
import * as orderItemController from '../controllers/orderItems'
import authMiddleware from '../middleware/authMiddleware'

const router = Router()
router.get('/get', authMiddleware, orderItemController.getOrderItem)

export default router
