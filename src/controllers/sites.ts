import { Request, Response, NextFunction, RequestHandler } from 'express'
import { pool } from '../db/index'
import { HttpError } from '../utils/httpError'
import { buildGetQuery } from '../utils/query/buildGetQuery'
import { buildGetTotalQuery } from '../utils/query/buildGetTotalQuery'
import { buildCreateQuery } from '../utils/query/buildCreateQuery'
import { buildUpdateQuery } from '../utils/query/buildUpdateQuery'
import { snakeToCamelObject } from '../utils/transform/toCamel'
import { AuthenticatedRequest } from '../types'

export const getSite = async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const getQueryResponse = await buildGetQuery(req, next, 'sites')
    if (!getQueryResponse) throw new HttpError('Query generation failed', 500)
    const getQueryTotalResponse = await buildGetTotalQuery(req, next, 'sites')
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
}

export const createSite = (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const { query, values } = buildCreateQuery('sites', req.body, req.file)
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

export const updateSite = (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const body = req.body
    const file = req.file
    if (!body.id) throw new HttpError('Required id', 400)
    await client.query('BEGIN')
    const update = {
      table: 'sites',
      data: {
        siteName: body.siteName,
      },
      where: { id: body.id },
      fieldMap: {
        siteName: 'site_name',
      },
    }
    if (file) {
      Object.assign(update.data, { siteFile: file.path })
      Object.assign(update.fieldMap, { siteFile: 'sites_file' })
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
