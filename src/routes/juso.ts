import { Router } from 'express'
import * as jusoController from '../controllers/juso'

const router = Router()

router.get('/get', jusoController.juso)

export default router
