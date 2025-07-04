import { Request, Response, NextFunction, RequestHandler } from 'express'
import { pool } from '../db/index'
import { HttpError } from '../utils/httpError'
import { buildGetQuery } from '../utils/query/buildGetQuery'
import { buildGetTotalQuery } from '../utils/query/buildGetTotalQuery'
import { buildCreateQuery } from '../utils/query/buildCreateQuery'
import { buildUpdateQuery } from '../utils/query/buildUpdateQuery'
import { snakeToCamelObject } from '../utils/transform/toCamel'
import { AuthenticatedRequest } from '../types'

export const createDeliveryAddress = (async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const client = await pool.connect()
  try {
    const { id } = req.user
    const body = req.body
    Object.assign(body, { userId: id })
    const { query, values } = buildCreateQuery('delivery_address', body)
    await client.query('BEGIN')
    const result = await client.query(query, values)
    await client.query('COMMIT')
    const camel = snakeToCamelObject(result.rows)
    res.status(201).json({ data: { rows: camel } })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}) as RequestHandler

export const getDeliveryAddress = async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const getQueryResponse = await buildGetQuery(req, next, 'delivery_address')
    if (!getQueryResponse) throw new HttpError('Query generation failed', 500)
    const getQueryTotalResponse = await buildGetTotalQuery(req, next, 'delivery_address')
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

export const updateDeliveryAddress = (async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const client = await pool.connect()
  try {
    const body = req.body
    if (!body.id) throw new HttpError('Required Id', 400)
    await client.query('BEGIN')
    const update = {
      table: 'delivery_address',
      data: {},
      where: { id: body.id },
      fieldMap: {},
    }
    if (body.deliveryName !== undefined) {
      Object.assign(update.data, { deliveryName: body.deliveryName })
      Object.assign(update.fieldMap, { deliveryName: 'delivery_name' })
    }
    if (body.deliveryRecipient !== undefined) {
      Object.assign(update.data, { deliveryRecipient: body.deliveryRecipient })
      Object.assign(update.fieldMap, { deliveryRecipient: 'delivery_recipient' })
    }
    if (body.deliveryPhoneNumber !== undefined) {
      Object.assign(update.data, { deliveryPhoneNumber: body.deliveryPhoneNumber })
      Object.assign(update.fieldMap, { deliveryPhoneNumber: 'delivery_phone_number' })
    }
    if (body.deliveryAddress !== undefined) {
      Object.assign(update.data, { deliveryAddress: body.deliveryAddress })
      Object.assign(update.fieldMap, { deliveryAddress: 'delivery_address' })
    }
    if (body.deliveryDetailAddress !== undefined) {
      Object.assign(update.data, { deliveryDetailAddress: body.deliveryDetailAddress })
      Object.assign(update.fieldMap, { deliveryDetailAddress: 'delivery_detail_address' })
    }
    if (body.deliveryDefault !== undefined) {
      Object.assign(update.data, { deliveryDefault: body.deliveryDefault })
      Object.assign(update.fieldMap, { deliveryDefault: 'delivery_default' })
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

export const deleteDeliveryAddress = (async (
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
    await client.query('DELETE FROM delivery_address WHERE id = $1', [id])
    await client.query('COMMIT')
    res.status(201).json({ message: 'Delete success' })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}) as RequestHandler
