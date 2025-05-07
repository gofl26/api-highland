import jwt from 'jsonwebtoken'
import { HttpError } from '../httpError'
import { PasswordNotIncludesUser } from '../../types/user/user'
const { PRIVATE_PASSWORD = '' } = process.env

interface DecodedAccessToken {
  sessionId: string
  user: PasswordNotIncludesUser
}

export const generateAccessToken = ({
  sessionId,
  user,
}: {
  sessionId: string
  user: PasswordNotIncludesUser
}) => {
  return jwt.sign({ sessionId, user }, PRIVATE_PASSWORD, { expiresIn: '24h' })
}
export const verifyAccessToken = (token: string): DecodedAccessToken => {
  const decoded = jwt.verify(token, PRIVATE_PASSWORD) as DecodedAccessToken

  if (!decoded || typeof decoded !== 'object' || !('sessionId' in decoded)) {
    throw new HttpError('Invalid token structure', 401)
  }

  return decoded
}
