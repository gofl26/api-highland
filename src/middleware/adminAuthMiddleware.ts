import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/auth/jwt'
import { HttpError } from '../utils/httpError'

export default function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpError('Authorization token missing or malformed', 401)
  }
  const token = authHeader.split(' ')[1]
  try {
    const { user }: any = verifyAccessToken(token)
    const { role = '' } = user
    if (role !== 'admin') throw new HttpError('No permission', 401)
    Object.assign(req, { user })
    next()
  } catch (error) {
    next(error)
  }
}
