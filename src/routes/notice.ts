import { Router } from 'express'
import * as noticeController from '../controllers/notice'
import adminAuthMiddleware from '../middleware/adminAuthMiddleware'

const router = Router()

router.post('/create', adminAuthMiddleware, noticeController.createNotice)
router.get('/get', noticeController.getNotice)
router.put('/update', adminAuthMiddleware, noticeController.updateNotice)
router.delete('/delete', adminAuthMiddleware, noticeController.deleteNotice)

export default router
