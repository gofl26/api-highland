import { Request, Response, NextFunction } from 'express'
import { pool } from '../db/index'
import { HttpError } from '../utils/httpError'
import { checkPassword } from '../utils/auth/bcrypt'
import { generateAccessToken, verifyAccessToken } from '../utils/auth/jwt'
import { User } from '../types/user/user'

interface UserSession {
  id: number
  user_id: number
  session_id: string
  login_at: string
  logout_at: string | null
  ip_address?: string
  user_agent?: string
  expires_at?: string
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  const userAgent = req.headers['user-agent'] || ''
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') as string
  try {
    if (!email || !password) {
      throw new HttpError('Bad request', 400)
    }
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user: User = result.rows[0]
    if (!user) throw new HttpError('Bad request', 400)

    const isCorrect = await checkPassword(password, user.password)
    if (isCorrect) {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      // ✅ 로그인 이력 저장
      const _result = await pool.query(
        `INSERT INTO user_session (user_id, ip_address, user_agent, expires_at) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [user.id, ip, userAgent, expiresAt],
      )
      if (_result) {
        const sessionId = _result.rows[0].id
        const _user: any = Object.entries(user).reduce((acc, [key, value]) => {
          if (key === 'password') return acc
          Object.assign(acc, { [key]: value })
          return acc
        }, {})
        const accessToken = generateAccessToken({ sessionId, user: _user })
        res.status(201).json({ accessToken, sessionId })
      } else throw new HttpError('Bad request', 400)
    } else {
      throw new HttpError('Bad request', 400)
    }
  } catch (error) {
    next(error)
  }
}

export const tokenVerify = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpError('Authorization token missing or malformed', 401)
    }
    const token = authHeader.split(' ')[1]
    const { user, sessionId } = verifyAccessToken(token)
    const result = await pool.query<UserSession>('SELECT * FROM user_session WHERE id = $1', [
      sessionId,
    ])
    const session = result.rows[0]

    if (!session) {
      throw new HttpError('Not find session', 400)
    }
    if (session.logout_at) {
      res.status(401).json({ message: 'Token is expired' })
      return
    }
    res.status(201).json({ message: 'Token is valid', user })
  } catch (error) {
    next(error)
  }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.body

    if (!sessionId) {
      throw new HttpError('Missing sessionId', 400)
    }

    const result = await pool.query(
      `UPDATE user_session 
         SET logout_at = NOW()
         WHERE id = $1
         RETURNING *`,
      [sessionId],
    )

    if (result.rowCount === 0) {
      throw new HttpError('Invalid session ID', 404)
    }
    res.status(201).json({ message: 'logout' })
  } catch (error) {
    next(error)
  }
}
