import { Request, Response, NextFunction, RequestHandler } from 'express'
import { pool } from '../db/index'
import { HttpError } from '../utils/httpError'
import { buildGetQuery } from '../utils/query/buildGetQuery'
import { buildGetTotalQuery } from '../utils/query/buildGetTotalQuery'
import { buildCreateQuery } from '../utils/query/buildCreateQuery'
import { buildUpdateQuery } from '../utils/query/buildUpdateQuery'
import { snakeToCamelObject } from '../utils/transform/toCamel'
import { AuthenticatedRequest } from '../types'

export const createMenu = (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const { query, values } = buildCreateQuery('menu', req.body)
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

export const getMenu = async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const getQueryResponse = await buildGetQuery(req, next, 'menu')
    if (!getQueryResponse) throw new HttpError('Query generation failed', 500)
    const getQueryTotalResponse = await buildGetTotalQuery(req, next, 'menu')
    if (!getQueryTotalResponse) throw new HttpError('Query generation failed', 500)
    const { query, params } = getQueryResponse
    const { totalQuery, totalParams } = getQueryTotalResponse

    await client.query('BEGIN')
    const result = await client.query(query, params)
    const totalResult = await client.query(totalQuery, totalParams)
    await client.query('COMMIT')
    const camel = snakeToCamelObject(result.rows)
    res.status(201).json({
      data: { rows: camel, total: Number(totalResult.rows[0].total) },
    })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}

export const updateMenu = (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const body = req.body
    if (!body.id) throw new HttpError('Required Id', 400)
    await client.query('BEGIN')
    const update = {
      table: 'menu',
      data: {},
      where: { id: body.id },
      fieldMap: {},
    }
    if (body.menuName !== undefined) {
      Object.assign(update.data, { menuName: body.menuName })
      Object.assign(update.fieldMap, { menuName: 'menu_name' })
    }
    if (body.menuUrl !== undefined) {
      Object.assign(update.data, { menuUrl: body.menuUrl })
      Object.assign(update.fieldMap, { menuUrl: 'menu_url' })
    }
    if (body.menuOrder !== undefined) {
      Object.assign(update.data, { menuOrder: body.menuOrder })
      Object.assign(update.fieldMap, { menuOrder: 'menu_order' })
    }
    if (body.active !== undefined) {
      Object.assign(update.data, { active: body.active })
      Object.assign(update.fieldMap, { active: 'active' })
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

export const deleteMenu = (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const body = req.body
    const { id } = body
    if (id === undefined) throw new HttpError('Bad Request', 400)
    await client.query('BEGIN')
    await client.query('DELETE FROM menu WHERE id = $1', [id])
    await client.query('COMMIT')
    res.status(201).json({ message: 'Delete success' })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}) as RequestHandler
