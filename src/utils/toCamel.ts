const snakeToCamel = (str: string) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}
export function snakeToCamelObject(obj: object): object {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamelObject)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const camelKey = snakeToCamel(key)
      Object.assign(acc, { [camelKey]: value })
      return acc
    }, {})
  }
  return obj
}
