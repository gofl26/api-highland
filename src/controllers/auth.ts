import { Request, Response, NextFunction } from 'express'
import { pool } from '../db/index'
import { HttpError } from '../utils/httpError'
import { checkPassword } from '../utils/auth/bcrypt'
import { generateAccessToken } from '../utils/auth/jwt'
import { User } from '../types/user/user'

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  try {
    if (!email || !password) {
      throw new HttpError('Bad request', 400)
    }
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user: User = result.rows[0]
    if (!user) throw new HttpError('Bad request', 400)

    const isCorrect = await checkPassword(password, user.password)
    if (isCorrect) {
      const _user: any = Object.entries(user).reduce((acc, [key, value]) => {
        if (key === 'password') return acc
        Object.assign(acc, { [key]: value })
        return acc
      }, {})
      const accessToken = generateAccessToken(_user)
      res.status(201).json({ accessToken })
    } else {
      throw new HttpError('Bad request', 400)
    }
  } catch (error) {
    next(error)
  }
}
