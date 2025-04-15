type UpdateQueryOptions<T extends Record<string, any>> = {
  table: string
  data: Partial<T>
  where: Record<string, any>
  fieldMap?: Record<keyof T, string> // camelCase → snake_case
}

export function buildUpdateQuery<T extends Record<string, any>>(options: UpdateQueryOptions<T>) {
  const { table, data, where, fieldMap = {} } = options

  const setFields: string[] = []
  const values: any[] = []

  let index = 1
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      const column = key in fieldMap ? fieldMap[key as keyof typeof fieldMap] : key
      setFields.push(`${column} = $${index++}`)
      values.push(value)
    }
  }

  if (setFields.length === 0) {
    throw new Error('No fields to update.')
  }

  const whereClauses = Object.entries(where).map(([key], i) => {
    const column = key in fieldMap ? fieldMap[key as keyof typeof fieldMap] : key
    return `${column} = $${index + i}`
  })
  values.push(...Object.values(where))

  const query = `UPDATE ${table} SET ${setFields.join(', ')} WHERE ${whereClauses.join(' AND ')}`

  return { query, values }
}
