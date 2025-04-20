import { Response, NextFunction, RequestHandler } from 'express'
import { pool } from '../db/index'
import { HttpError } from '../utils/httpError'
import { buildGetQuery } from '../utils/query/buildGetQuery'
import { buildGetTotalQuery } from '../utils/query/buildGetTotalQuery'
import { snakeToCamelObject } from '../utils/transform/toCamel'
import { AuthenticatedRequest } from '../types'

export const getOrderItem = (async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const client = await pool.connect()
  try {
    const { id } = req.user
    Object.assign(req.query, { userId: id })
    const getQueryResponse = await buildGetQuery(req, next, 'orders')
    if (!getQueryResponse) throw new HttpError('Query generation failed', 500)
    const getQueryTotalResponse = await buildGetTotalQuery(req, next, 'orders')
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
