import { Request, Response, NextFunction, RequestHandler } from 'express'
import { pool } from '../db/index'
import { HttpError } from '../utils/httpError'
import { buildGetQuery } from '../utils/query/buildGetQuery'
import { buildGetTotalQuery } from '../utils/query/buildGetTotalQuery'
import { buildCreateQuery } from '../utils/query/buildCreateQuery'
import { buildUpdateQuery } from '../utils/query/buildUpdateQuery'
import { snakeToCamelObject } from '../utils/transform/toCamel'
import { AuthenticatedRequest } from '../types'

export const createProduct = (async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const client = await pool.connect()
  try {
    const { query, values } = buildCreateQuery('products', req.body, req.file)
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

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const getQueryResponse = await buildGetQuery(req, next, 'products')
    if (!getQueryResponse) throw new HttpError('Query generation failed', 500)
    const getQueryTotalResponse = await buildGetTotalQuery(req, next, 'products')
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

export const updateProduct = (async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const client = await pool.connect()
  try {
    const body = req.body
    const file = req.file
    if (!body.id) throw new HttpError('Required id', 400)
    await client.query('BEGIN')
    const update = {
      table: 'products',
      data: {},
      where: { id: body.id },
      fieldMap: {},
    }
    if (body.userId !== undefined) {
      Object.assign(update.data, { userId: body.userId })
      Object.assign(update.fieldMap, { userId: 'user_id' })
    }
    if (body.categoryId !== undefined) {
      Object.assign(update.data, { categoryId: body.categoryId })
      Object.assign(update.fieldMap, { categoryId: 'category_id' })
    }
    if (body.productPrice !== undefined) {
      Object.assign(update.data, { productPrice: body.productPrice })
      Object.assign(update.fieldMap, { productPrice: 'product_price' })
    }
    if (body.productState !== undefined) {
      Object.assign(update.data, { productState: body.productState })
      Object.assign(update.fieldMap, { productState: 'product_state' })
    }
    if (body.productQuality !== undefined) {
      Object.assign(update.data, { productQuality: body.productQuality })
      Object.assign(update.fieldMap, { productQuality: 'product_quality' })
    }
    if (body.productOrder !== undefined) {
      Object.assign(update.data, { productOrder: body.productOrder })
      Object.assign(update.fieldMap, { productOrder: 'product_order' })
    }
    if (body.productName !== undefined) {
      Object.assign(update.data, { productName: body.productName })
      Object.assign(update.fieldMap, { productName: 'product_name' })
    }
    if (file) {
      Object.assign(update.data, { productFile: file.path })
      Object.assign(update.fieldMap, { productFile: 'products_file' })
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

export const deleteProduct = (async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const client = await pool.connect()
  try {
    const body = req.body
    const { id } = body
    if (id === undefined) throw new HttpError('Bad Request', 400)
    await client.query('COMMIT')
    await client.query('DELETE FROM products WHERE id = $1', [id])
    await client.query('COMMIT')
    res.status(201).json({ message: 'Delete success' })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}) as RequestHandler
