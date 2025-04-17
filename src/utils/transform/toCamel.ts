const snakeToCamel = (str: string) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}
export function snakeToCamelObject(value: object | object[]): object {
  if (Array.isArray(value)) {
    return value.map(snakeToCamelObject)
  } else if (value !== null && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [key, value]) => {
      const camelKey = snakeToCamel(key)
      Object.assign(acc, { [camelKey]: value })
      return acc
    }, {})
  }
  return value
}
