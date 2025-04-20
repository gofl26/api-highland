import { Router } from 'express'
import * as reviewController from '../controllers/reviews'
import authMiddleware from '../middleware/authMiddleware'
import upload from '../middleware/multer'

const router = Router()
router.post('/create', authMiddleware, upload.single('file'), reviewController.createReview)
router.get('/get', reviewController.getReview)
router.put('/update', authMiddleware, upload.single('file'), reviewController.updateReview)
router.delete('/delete', authMiddleware, reviewController.deleteReview)

export default router
