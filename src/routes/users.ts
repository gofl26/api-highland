import { Router } from 'express'
import * as userController from '../controllers/users'
import authMiddleware from '../middleware/authMiddleware'

const router = Router()

router.post('/users/create', userController.createUser)
router.get('/users/get', authMiddleware, userController.getUser)
router.put('/users/update', authMiddleware, userController.updateUser)
router.put('/users/delete', authMiddleware, userController.deleteUser)

router.get('/users/checkEmail', userController.checkEmail)
router.post('/users/checkUser', authMiddleware, userController.checkUser)
router.get('/users/getAll', authMiddleware, userController.getUsers)
export default router
