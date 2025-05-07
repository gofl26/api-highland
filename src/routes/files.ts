import { Router } from 'express'
import * as filesController from '../controllers/files'
import adminAuthMiddleware from '../middleware/adminAuthMiddleware'
import upload from '../middleware/multer'

const router = Router()

router.get('/getFile', filesController.getFile)
router.post('/upload', adminAuthMiddleware, upload.single('file'), filesController.uploadFile)

export default router
