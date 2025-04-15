import jwt from 'jsonwebtoken'
import { HttpError } from '../utils/httpError'

const { PRIVATE_PASSWORD = '' } = process.env

export const generateAccessToken = (id: string) => {
  return jwt.sign({ id }, PRIVATE_PASSWORD, { expiresIn: '1h' })
}
export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, PRIVATE_PASSWORD, (err, decoded) => {
    if (err) throw new HttpError('Invalid or expired token', 401)
    else return decoded
  })
}
