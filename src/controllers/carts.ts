import { Response, NextFunction, RequestHandler } from 'express'
import { pool } from '../db/index'
import { HttpError } from '../utils/httpError'
import { buildGetQuery } from '../utils/query/buildGetQuery'
import { buildGetTotalQuery } from '../utils/query/buildGetTotalQuery'
import { buildCreateQuery } from '../utils/query/buildCreateQuery'
import { buildUpdateQuery } from '../utils/query/buildUpdateQuery'
import { snakeToCamelObject } from '../utils/transform/toCamel'
import { AuthenticatedRequest } from '../types'

export const createCart = (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const { id } = req.user
    const body = req.body
    Object.assign(body, { userId: id })
    const { query, values } = buildCreateQuery('carts', body)
    await client.query('BEGIN')
    const result = await client.query(query, values)
    const camel = snakeToCamelObject(result.rows)
    await client.query('COMMIT')
    res.status(201).json({ data: { rows: camel } })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}) as RequestHandler

export const getCart = (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const { id, role } = req.user
    if (role !== 'admin') Object.assign(req.query, { userId: id })
    const getQueryResponse = await buildGetQuery(req, next, 'carts')
    if (!getQueryResponse) throw new HttpError('Query generation failed', 500)
    const getQueryTotalResponse = await buildGetTotalQuery(req, next, 'carts')
    if (!getQueryTotalResponse) throw new HttpError('Query generation failed', 500)
    const { query, params } = getQueryResponse
    const { totalQuery, totalParams } = getQueryTotalResponse
    await client.query('BEGIN')
    const result = await client.query(query, params)
    const totalResult = await client.query(totalQuery, totalParams)
    await client.query('COMMIT')
    const rows = snakeToCamelObject(result.rows)
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

export const updateCart = (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const body = req.body
    if (!body.id) throw new HttpError('Required id', 400)
    await client.query('BEGIN')
    const update = {
      table: 'carts',
      data: {},
      where: { id: body.id },
      fieldMap: {},
    }
    if (body.cartQuantity !== undefined) {
      Object.assign(update.data, { cartQuantity: body.cartQuantity })
      Object.assign(update.fieldMap, { cartQuantity: 'cart_quantity' })
    }
    const { query, values } = buildUpdateQuery(update)
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

export const deleteCart = (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const body = req.body
    const { id } = body
    if (id === undefined) throw new HttpError('Bad Request', 400)
    await client.query('BEGIN')
    await client.query('DELETE FROM carts WHERE id = $1', [id])
    await client.query('COMMIT')
    res.status(201).json({ message: 'Delete success' })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}) as RequestHandler
