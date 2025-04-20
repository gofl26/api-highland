const toCamelCase = (str: string): string =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())

export function snakeToCamelObject<T extends Record<string, any>>(arr: T[]): T[] {
  return arr.map((obj) => {
    const converted: Record<string, any> = {}
    for (const key in obj) {
      const camelKey = toCamelCase(key)
      converted[camelKey] = obj[key]
    }
    return converted as T
  })
}
