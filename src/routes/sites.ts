import { Router } from 'express'
import * as siteController from '../controllers/sites'
import adminAuthMiddleware from '../middleware/adminAuthMiddleware'
import upload from '../middleware/multer'

const router = Router()

router.get('/get', siteController.getSite)
router.post('/create', adminAuthMiddleware, upload.single('file'), siteController.createSite)
router.put('/update', adminAuthMiddleware, upload.single('file'), siteController.updateSite)

export default router
