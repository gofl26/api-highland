import { Router } from 'express'
import * as jusoController from '../controllers/juso'

const router = Router()

router.get('/juso', jusoController.juso)

export default router
