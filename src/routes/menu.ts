import { Router } from 'express'
import * as menuController from '../controllers/menu'
import adminAuthMiddleware from '../middleware/adminAuthMiddleware'

const router = Router()

router.post('/create', adminAuthMiddleware, menuController.createMenu)
router.get('/get', menuController.getMenu)
router.put('/update', adminAuthMiddleware, menuController.updateMenu)
router.delete('/delete', adminAuthMiddleware, menuController.deleteMenu)

export default router
