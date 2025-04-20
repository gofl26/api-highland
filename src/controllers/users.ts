import { Request, Response, NextFunction, RequestHandler } from 'express'
import { pool } from '../db/index'
import { HttpError } from '../utils/httpError'
import { hashPassword, checkPassword } from '../utils/auth/bcrypt'
import { snakeToCamelObject } from '../utils/transform/toCamel'
import { buildUpdateQuery } from '../utils/query/buildUpdateQuery'
import { buildGetQuery } from '../utils/query/buildGetQuery'
import { buildGetTotalQuery } from '../utils/query/buildGetTotalQuery'
import { AuthenticatedRequest } from '../types'

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const { email, password, userName, phoneNumber, gender, kakaoId } = req.body
    if (!userName || !email || !password) {
      throw new HttpError('Bad request', 400)
    }
    await client.query('BEGIN')
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email])
    if (result.rows.length === 1) throw new HttpError('Bad request: exist email', 400)
    const hashedPassword = await hashPassword(password)
    await client.query(
      'INSERT INTO users (user_name, email, password, phone_number, gender, role, kakao_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userName, email, hashedPassword, phoneNumber, gender, 'customer', kakaoId],
    )
    await client.query('COMMIT')
    res.status(201).json({ message: 'Success register' })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}

export const getUser = (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user
    if (!id) throw new HttpError('Bad request', 400)
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    if (result.rows.length === 0) throw new HttpError('Bad request', 400)
    const camel = snakeToCamelObject(result.rows)
    const passwordNotIncludes = Object.entries(camel[0]).reduce((acc, [key, value]) => {
      if (key === 'password') return acc
      Object.assign(acc, { [key]: value })
      return acc
    }, {})
    res.status(201).json({ data: passwordNotIncludes })
  } catch (err) {
    next(err)
  }
}) as RequestHandler

export const updateUser = (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const body = req.body
    const { id } = req.user
    if (!id) throw new HttpError('Bad request: required id', 400)
    await client.query('BEGIN')
    if (body.password) {
      const hashedPassword = await hashPassword(body.password)
      Object.assign(body, { password: hashedPassword })
    }
    const { query, values } = buildUpdateQuery({
      table: 'users',
      data: {
        userName: body.userName,
        phoneNumber: body.phoneNumber,
        password: body.password,
        role: body.role,
      },
      where: { id },
      fieldMap: {
        userName: 'user_name',
        phoneNumber: 'phone_number',
        password: 'password',
        role: 'role',
      },
    })
    await client.query(query, values)
    await client.query('COMMIT')
    res.status(201).json({ message: 'Edit success' })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}) as RequestHandler

export const deleteUser = (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const { id } = req.user
    if (!id) throw new HttpError('Bad request: required id', 400)
    await client.query('BEGIN')
    await client.query('DELETE FROM users WHERE id = $1', [id])
    await client.query('COMMIT')
    res.status(201).json({ message: 'Delete success' })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}) as RequestHandler

export const checkEmail = (async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.query
  try {
    if (!email) throw new HttpError('Bad request: required email', 400)
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) return res.status(201).json({ message: 'Available email' })
    else throw new HttpError('Not available email', 400)
  } catch (err) {
    next(err)
  }
}) as RequestHandler

export const checkUser = (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { password } = req.body
  const { id } = req.user
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    if (result.rows.length === 0) throw new HttpError('Wrong Password', 400)
    else {
      const isCorrect = await checkPassword(password, result.rows[0].password)
      if (isCorrect) res.status(201).json({ message: 'Match success' })
      else throw new HttpError('Wrong Password', 400)
    }
  } catch (err) {
    next(err)
  }
}) as RequestHandler

export const getUsers = (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const getQueryResponse = await buildGetQuery(req, next, 'users')
    if (!getQueryResponse) throw new HttpError('Query generation failed', 500)
    const getQueryTotalResponse = await buildGetTotalQuery(req, next, 'users')
    if (!getQueryTotalResponse) throw new HttpError('Query generation failed', 500)
    const { query, params } = getQueryResponse
    const { totalQuery, totalParams } = getQueryTotalResponse
    await client.query('BEGIN')
    const result = await client.query(query, params)
    const totalResult = await client.query(totalQuery, totalParams)
    await client.query('COMMIT')
    const camel = snakeToCamelObject(result.rows)
    const rows = camel.map((obj) => {
      const passwordNotIncludes = Object.entries(obj).reduce((acc, [key, value]) => {
        if (key === 'password') return acc
        Object.assign(acc, { [key]: value })
        return acc
      }, {})
      return passwordNotIncludes
    })
    res.status(201).json({
      data: { rows, total: Number(totalResult.rows[0].total) },
    })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}) as RequestHandler
