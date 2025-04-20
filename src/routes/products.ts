import { Router } from 'express'
import * as productController from '../controllers/products'
import adminAuthMiddleware from '../middleware/adminAuthMiddleware'
import upload from '../middleware/multer'

const router = Router()
router.post('/create', adminAuthMiddleware, upload.single('file'), productController.createProduct)
router.get('/get', productController.getProduct)
router.put('/update', adminAuthMiddleware, upload.single('file'), productController.updateProduct)
router.delete('/delete', adminAuthMiddleware, productController.deleteProduct)

export default router
