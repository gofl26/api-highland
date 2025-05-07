import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/auth/jwt'
import { HttpError } from '../utils/httpError'

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpError('Authorization token missing or malformed', 401)
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = verifyAccessToken(token)
    Object.assign(req, { user: decoded.user })
    next()
  } catch (error) {
    next(error)
  }
}
