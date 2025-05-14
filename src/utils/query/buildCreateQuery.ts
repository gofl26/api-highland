import { toSnakeCase } from '../../utils/transform/toSnake'

type InsertQuery = {
  query: string
  values: any[]
}

/**
 * req.body 기반 INSERT SQL문 생성
 * @param tableName INSERT할 테이블명
 * @param body req.body 객체
 */
export function buildCreateQuery(
  tableName: string,
  body: Record<string, any>,
  file?: Express.Multer.File,
): InsertQuery {
  const keys = Object.keys(body)
  const snakeKeys = keys.map(toSnakeCase)
  const values = keys.map((key) => {
    const val = body[key]

    // FormData에서 온 값이 JSON 문자열이면 자동 파싱
    try {
      const parsed = JSON.parse(val)
      return parsed
    } catch {
      return val
    }
  })

  if (file) {
    const fileKey = toSnakeCase(file.fieldname)
    snakeKeys.push(`${tableName}_${fileKey}`)
    values.push(file.filename) // 또는 file.filename 사용 가능
  }

  const columns = snakeKeys.map((k) => `"${k}"`).join(', ')
  const placeholders = snakeKeys.map((_, i) => `$${i + 1}`).join(', ')

  const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`

  return { query, values }
}
