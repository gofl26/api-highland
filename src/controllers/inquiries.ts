import { Response, NextFunction, RequestHandler } from 'express'
import { pool } from '../db/index'
import { HttpError } from '../utils/httpError'
import { buildGetQuery } from '../utils/query/buildGetQuery'
import { buildGetTotalQuery } from '../utils/query/buildGetTotalQuery'
import { buildCreateQuery } from '../utils/query/buildCreateQuery'
import { buildUpdateQuery } from '../utils/query/buildUpdateQuery'
import { snakeToCamelObject } from '../utils/transform/toCamel'
import { AuthenticatedRequest } from '../types'

export const createInquiry = (async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const client = await pool.connect()
  try {
    const { id } = req.user
    const body = req.body
    Object.assign(body, { userId: id })
    const { query, values } = buildCreateQuery('inquiries', body, req.file)
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

export const getInquiry = (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const getQueryResponse = await buildGetQuery(
      req,
      next,
      'inquiries',
      [
        {
          table: 'users',
          type: 'INNER',
          on: 'users.id = inquiries.user_id',
        },
        {
          table: 'products',
          type: 'INNER',
          on: 'products.id = inquiries.product_id',
        },
      ],
      'inquiries.*, users.user_name AS user_name, products.product_name AS product_name',
    )
    if (!getQueryResponse) throw new HttpError('Query generation failed', 500)
    const getQueryTotalResponse = await buildGetTotalQuery(req, next, 'inquiries')
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

export const updateInquiry = (async (
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
      table: 'inquiries',
      data: {},
      where: { id: body.id },
      fieldMap: {},
    }
    if (body.inquiriesCategory !== undefined) {
      Object.assign(update.data, { inquiriesCategory: body.inquiriesCategory })
      Object.assign(update.fieldMap, { inquiriesCategory: 'inquiry_category' })
    }
    if (body.inquiryTitle !== undefined) {
      Object.assign(update.data, { inquiryTitle: body.inquiryTitle })
      Object.assign(update.fieldMap, { inquiryTitle: 'inquiry_title' })
    }
    if (body.inquiryDesc !== undefined) {
      Object.assign(update.data, { inquiryDesc: body.inquiryDesc })
      Object.assign(update.fieldMap, { inquiryDesc: 'inquiry_desc' })
    }
    if (body.inquiryAnswer !== undefined) {
      Object.assign(update.data, { inquiryAnswer: body.inquiryAnswer })
      Object.assign(update.fieldMap, { inquiryAnswer: 'inquiry_answer' })
    }
    if (body.inPublic !== undefined) {
      Object.assign(update.data, { inPublic: body.inPublic })
      Object.assign(update.fieldMap, { inPublic: 'is_public' })
    }
    if (body.answerAt !== undefined) {
      Object.assign(update.data, { answerAt: body.answerAt })
      Object.assign(update.fieldMap, { answerAt: 'answer_at' })
    }
    if (file) {
      Object.assign(update.data, { inquiriesFile: file.path })
      Object.assign(update.fieldMap, { inquiriesFile: 'inquiries_file' })
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

export const deleteInquiry = (async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const client = await pool.connect()
  try {
    const body = req.body
    const { id } = body
    if (id === undefined) throw new HttpError('Bad Request', 400)
    await client.query('BEGIN')
    await client.query('DELETE FROM inquiries WHERE id = $1', [id])
    await client.query('COMMIT')
    res.status(201).json({ message: 'Delete success' })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}) as RequestHandler
