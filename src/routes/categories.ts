import { Router } from 'express'
import * as categoryController from '../controllers/categories'
import adminAuthMiddleware from '../middleware/adminAuthMiddleware'

const router = Router()
router.post('/create', adminAuthMiddleware, categoryController.createCategory)
router.get('/get', categoryController.getCategory)
router.put('/update', adminAuthMiddleware, categoryController.updateCategory)
router.delete('/delete', adminAuthMiddleware, categoryController.deleteCategory)

export default router
