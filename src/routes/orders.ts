import { Router } from 'express'
import * as orderController from '../controllers/orders'
import authMiddleware from '../middleware/authMiddleware'

const router = Router()
router.post('/create', authMiddleware, orderController.createOrder)
router.get('/get', authMiddleware, orderController.getOrder)
router.put('/update', authMiddleware, orderController.updateOrder)
router.delete('/delete', authMiddleware, orderController.deleteOrder)

export default router
