import { Router } from 'express'
import * as userController from '../controllers/users'
import authMiddleware from '../middleware/authMiddleware'
import adminAuthMiddleware from '../middleware/adminAuthMiddleware'

const router = Router()

router.post('/create', userController.createUser)
router.get('/get', authMiddleware, userController.getUser)
router.put('/update', authMiddleware, userController.updateUser)
router.delete('/delete', authMiddleware, userController.deleteUser)

router.get('/checkEmail', userController.checkEmail)
router.post('/checkUser', authMiddleware, userController.checkUser)
router.get('/getAll', adminAuthMiddleware, userController.getUsers)

export default router
