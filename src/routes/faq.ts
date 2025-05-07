import { Router } from 'express'
import * as faqController from '../controllers/faq'
import adminAuthMiddleware from '../middleware/adminAuthMiddleware'

const router = Router()

router.post('/create', adminAuthMiddleware, faqController.createFaq)
router.get('/get', faqController.getFaq)
router.put('/update', adminAuthMiddleware, faqController.updateFaq)
router.delete('/delete', adminAuthMiddleware, faqController.deleteFaq)

export default router
