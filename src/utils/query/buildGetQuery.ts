import { Request, NextFunction } from 'express'
import { toSnakeCase } from '../transform/toSnake'
import { HttpError } from '../httpError'

type JoinOption = {
  table: string
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
  on: string
}

export const buildGetQuery = async (
  req: Request,
  next: NextFunction,
  table: string,
  joins: JoinOption[] = [],
  selects: string = '*',
) => {
  try {
    const { from = 0, size = 10, sort = '', sdate, edate, date = 'createdAt', ...body } = req.query
    const queryArray = [`SELECT ${selects} FROM ${table}`]
    const whereArray = []
    const params: any[] = []

    // JOIN 절 추가
    joins.forEach(({ table: joinTable, type, on }) => {
      const upperType = type.toUpperCase()
      if (!['INNER', 'LEFT', 'RIGHT', 'FULL'].includes(upperType))
        throw new HttpError('Invalid join type', 400)
      queryArray.push(`${upperType} JOIN ${joinTable} ON ${on}`)
    })

    // WHERE 조건 처리
    Object.entries(body).forEach(([key, value]) => {
      const checkWhereKey = key.split('.')
      if (checkWhereKey.length === 1) {
        whereArray.push({ key: toSnakeCase(key), value, type: 'match' })
      } else if (checkWhereKey.length === 2) {
        const [col, op] = checkWhereKey
        if (op === 'like') {
          whereArray.push({ key: toSnakeCase(col), value, type: 'like' })
        } else if (op === 'not') {
          whereArray.push({ key: toSnakeCase(col), value, type: 'not' })
        } else if (op === 'or') {
          whereArray.push({ key: toSnakeCase(col), value, type: 'or' })
        } else {
          throw new HttpError('Bad request', 400)
        }
      } else {
        throw new HttpError('Bad request', 400)
      }
    })
    if (sdate && edate)
      whereArray.push({
        key: typeof date === 'string' ? toSnakeCase(date) : date,
        type: 'date',
        value: null,
      })
    if (whereArray.length > 0) {
      queryArray.push('WHERE')
      whereArray.forEach(({ key, value, type }, index) => {
        if (index > 0) {
          if (type === 'or') queryArray.push('OR')
          else queryArray.push('AND')
        }

        if (type === 'match' || type === 'or') {
          queryArray.push(`${key} = $${params.length + 1}`)
          params.push(value)
        } else if (type === 'like') {
          queryArray.push(`${key} LIKE $${params.length + 1}`)
          params.push(`%${value}%`)
        } else if (type === 'not') {
          queryArray.push(`${key} != $${params.length + 1}`)
          params.push(value)
        } else if (type === 'date') {
          queryArray.push(`${key} BETWEEN '${sdate}' AND '${edate}'`)
        }
      })
    }
    const sortStr = getSortString(sort)
    if (sortStr) {
      const checkSortKey = sortStr.split(':')
      if (checkSortKey.length === 2) {
        queryArray.push(
          `ORDER BY ${toSnakeCase(checkSortKey[0])} ${checkSortKey[1] === 'desc' ? 'DESC' : 'ASC'}`,
        )
      } else {
        throw new HttpError('Bad request', 400)
      }
    } else {
      queryArray.push(`ORDER BY updated_at DESC`)
    }

    // LIMIT OFFSET
    queryArray.push(`LIMIT ${Number(size)} OFFSET ${Number(from)}`)
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
