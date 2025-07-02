import { Response, NextFunction, RequestHandler } from 'express'
import { pool } from '../db/index'
import { HttpError } from '../utils/httpError'
import { buildGetQuery } from '../utils/query/buildGetQuery'
import { buildGetTotalQuery } from '../utils/query/buildGetTotalQuery'
import { buildCreateQuery } from '../utils/query/buildCreateQuery'
import { buildUpdateQuery } from '../utils/query/buildUpdateQuery'
import { snakeToCamelObject } from '../utils/transform/toCamel'
import { AuthenticatedRequest } from '../types'

export const createOrder = (async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const client = await pool.connect()
  try {
    const { id } = req.user
    const { orderList, ...restBody } = req.body
    if (!Array.isArray(orderList)) throw new HttpError('Bad request', 400)
    const deleteCartIdList: string[] = []
    orderList.forEach(({ productId, productPrice, cartQuantity, cartId }) => {
      if (!productId || !productPrice || !cartQuantity || !cartId)
        throw new HttpError('Bad request', 400)
      deleteCartIdList.push(cartId)
    })
    Object.assign(restBody, { userId: id, orderStatus: '입금대기' })
    const { query, values } = buildCreateQuery('orders', restBody)
    await client.query('BEGIN')
    const result = await client.query(query, values)
    const camel = snakeToCamelObject(result.rows)
    const orderItemsParams: any[] = []
    const valuesPlaceholder: string[] = []
    orderList.forEach(({ productId, productPrice, cartQuantity }, index) => {
      const offset = index * 5
      valuesPlaceholder.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`,
      )
      orderItemsParams.push(result.rows[0].id, productId, cartQuantity, productPrice, id)
    })
    const orderItemQuery = `INSERT INTO order_items (order_id, product_id, order_quantity, product_price, user_id) VALUES ${valuesPlaceholder.join(', ')}`
    await client.query(orderItemQuery, orderItemsParams)
    //카트 삭제
    for (let i = 0; i < deleteCartIdList.length; i++) {
      await client.query(
        `
        DELETE FROM carts WHERE id = $1
      `,
        [deleteCartIdList[i]],
      )
    }
    await client.query('COMMIT')
    res.status(201).json({ data: { rows: camel } })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}) as RequestHandler

export const getOrder = (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect()
  try {
    const { id, role } = req.user
    if (role !== 'admin') Object.assign(req.query, { userId: id })
    // const getQueryResponse = await buildGetQuery(req, next, 'orders')
    const getQueryResponse = await buildGetQuery(
      req,
      next,
      'orders',
      [
        {
          table: 'order_items',
          type: 'INNER',
          on: 'order_items.order_id = orders.id',
        },
        {
          table: 'products',
          type: 'INNER',
          on: 'products.id = order_items.product_id',
        },
      ],
      'orders.*, products.product_name AS product_name, products.products_file AS product_file, order_items.product_price AS product_price, order_items.order_quantity AS order_quantity',
    )
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

export const updateOrder = (async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const client = await pool.connect()
  try {
    const body = req.body
    if (!body.id) throw new HttpError('Required id', 400)
    await client.query('BEGIN')
    const update = {
      table: 'orders',
      data: {},
      where: { id: body.id },
      fieldMap: {},
    }
    if (body.payMethod !== undefined) {
      Object.assign(update.data, { payMethod: body.payMethod })
      Object.assign(update.fieldMap, { payMethod: 'pay_method' })
    }
    if (body.address !== undefined) {
      Object.assign(update.data, { address: body.address })
      Object.assign(update.fieldMap, { address: 'address' })
    }
    if (body.addressDetail !== undefined) {
      Object.assign(update.data, { addressDetail: body.addressDetail })
      Object.assign(update.fieldMap, { addressDetail: 'address_detail' })
    }
    if (body.bankCode !== undefined) {
      Object.assign(update.data, { bankCode: body.bankCode })
      Object.assign(update.fieldMap, { bankCode: 'bank_code' })
    }
    if (body.accountNumber !== undefined) {
      Object.assign(update.data, { accountNumber: body.accountNumber })
      Object.assign(update.fieldMap, { accountNumber: 'account_number' })
    }
    if (body.deliveryCost !== undefined) {
      Object.assign(update.data, { deliveryCost: body.deliveryCost })
      Object.assign(update.fieldMap, { deliveryCost: 'delivery_cost' })
    }
    if (body.trackingNumber !== undefined) {
      Object.assign(update.data, { trackingNumber: body.trackingNumber })
      Object.assign(update.fieldMap, { trackingNumber: 'tracking_number' })
    }
    if (body.orderStatus !== undefined) {
      Object.assign(update.data, { orderStatus: body.orderStatus })
      Object.assign(update.fieldMap, { orderStatus: 'order_status' })
    }
    if (body.phoneNumber !== undefined) {
      Object.assign(update.data, { phoneNumber: body.phoneNumber })
      Object.assign(update.fieldMap, { phoneNumber: 'phone_number' })
    }
    if (body.recipient !== undefined) {
      Object.assign(update.data, { recipient: body.recipient })
      Object.assign(update.fieldMap, { recipient: 'recipient' })
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

export const deleteOrder = (async (
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
    await client.query('DELETE FROM orders WHERE id = $1', [id])
    await client.query('COMMIT')
    res.status(201).json({ message: 'Delete success' })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}) as RequestHandler
