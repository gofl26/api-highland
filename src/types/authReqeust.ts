import { Request } from 'express'
import { PasswordNotIncludesUser } from '../types/user/user'
export interface AuthenticatedRequest extends Request {
  user: PasswordNotIncludesUser
}
