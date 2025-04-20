import { Router } from 'express'
import * as inquiryController from '../controllers/inquiries'
import authMiddleware from '../middleware/authMiddleware'
import upload from '../middleware/multer'

const router = Router()

router.post('/create', authMiddleware, upload.single('file'), inquiryController.createInquiry)
router.get('/get', inquiryController.getInquiry)
router.put('/update', authMiddleware, upload.single('file'), inquiryController.updateInquiry)
router.delete('/delete', authMiddleware, inquiryController.deleteInquiry)

export default router
