import jwt from 'jsonwebtoken'
import { HttpError } from '../httpError'
import { PasswordNotIncludesUser } from '../../types/user/user'
const { PRIVATE_PASSWORD = '' } = process.env

export const generateAccessToken = (user: PasswordNotIncludesUser) => {
  return jwt.sign(user, PRIVATE_PASSWORD, { expiresIn: '24h' })
}
export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, PRIVATE_PASSWORD, (err, decoded) => {
    if (err) throw new HttpError('Invalid or expired token', 401)
    else return decoded
  })
}
