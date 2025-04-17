import { Request, NextFunction } from 'express'
import { toSnakeCase } from '../transform/toSnake'
import { HttpError } from '../httpError'

export const buildGetQuery = async (req: Request, next: NextFunction, table: string) => {
  try {
    const { from = 0, size = 10, sort = '', sdate, edate, date = 'created', ...body } = req.query
    const queryArray = [`SELECT * FROM ${table}`]
    const whereArray = []
    const params = []
    Object.entries(body).forEach(([key, value]) => {
      const checkWhereKey = key.split('.')
      if (checkWhereKey.length === 1)
        whereArray.push({ key: toSnakeCase(key), value, type: 'match' })
      else if (checkWhereKey.length === 2) {
        if (checkWhereKey[1] === 'like')
          whereArray.push({
            key: toSnakeCase(checkWhereKey[0]),
            value,
            type: 'like',
          })
        else if (checkWhereKey[1] === 'not')
          whereArray.push({
            key: toSnakeCase(checkWhereKey[0]),
            value,
            type: 'not',
          })
        else if (checkWhereKey[1] === 'or')
          whereArray.push({
            key: toSnakeCase(checkWhereKey[0]),
            value,
            type: 'or',
          })
      } else {
        throw new HttpError('Bad request', 400)
      }
    })
    if (sdate && edate) whereArray.push({ key: date, type: 'date', value: null })
    if (whereArray.length > 1) {
      whereArray.forEach(({ key, value, type }, index) => {
        if (!index) queryArray.push('WHERE')
        if (index !== 0 && (index || type !== 'or')) queryArray.push('AND')
        else if (index || type === 'or') queryArray.push('OR')
        if (type === 'match' || type === 'or') queryArray.push(`${key} = $${index + 1}`)
        else if (type === 'like') queryArray.push(`${key} LIKE $${index + 1}`)
        else if (type === 'not') queryArray.push(`${key} != %$${index + 1}%`)
        else if (type === 'date') queryArray.push(`${key} BETWEEN ${sdate} AND ${edate}`)
        if (type !== 'date') {
          if (type === 'like') params.push(`%${value}%`)
          else params.push(value)
        }
      })
    } else if (whereArray.length === 1) {
      if (whereArray[0].type === 'date') {
        queryArray.push(`${whereArray[0].key} BETWEEN ${sdate} AND ${edate}`)
      } else if (whereArray[0].type === 'like') {
        queryArray.push(`WHERE ${whereArray[0].key} LIKE '%${whereArray[0].value}%'`)
      } else {
        queryArray.push(`WHERE ${whereArray[0].key} = $1`)
        params.push(whereArray[0].value)
      }
    }
    const sortStr = getSortString(sort)
    if (sortStr) {
      const checkSortKey = sortStr.split(':')
      if (checkSortKey.length === 2) {
        queryArray.push(
          `GROUP BY id, ${toSnakeCase(checkSortKey[0])} ORDER BY ${toSnakeCase(checkSortKey[0])} ${checkSortKey[1] === 'desc' ? 'DESC' : 'ASC'}`,
        )
      } else {
        throw new HttpError('Bad request', 400)
      }
    }
    queryArray.push(`LIMIT ${size} OFFSET ${from}`)
    const query = queryArray.join(' ')
    return { query, params }
  } catch (error) {
    next(error)
  }
}

function getSortString(raw: unknown): string | null {
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0]
  return null
}
