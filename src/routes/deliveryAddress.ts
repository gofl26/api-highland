import { Router } from 'express'
import * as deliveryAddressController from '../controllers/deliveryAddress'
import authMiddleware from '../middleware/authMiddleware'

const router = Router()
router.post('/create', authMiddleware, deliveryAddressController.createDeliveryAddress)
router.get('/get', deliveryAddressController.getDeliveryAddress)
router.put('/update', authMiddleware, deliveryAddressController.updateDeliveryAddress)
router.delete('/delete', authMiddleware, deliveryAddressController.deleteDeliveryAddress)

export default router
