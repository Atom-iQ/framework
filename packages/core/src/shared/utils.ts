/**
 * @function isArray
 */
export const isArray = Array.isArray

export function isStringOrNumber(value: unknown): value is string | number {
  const type = typeof value

  return type === 'string' || type === 'number'
}

export function isNullOrUndef(value: unknown): value is undefined | null {
  return value === void 0 || value === null
}

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function'
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isBoolean(value: unknown): value is boolean {
  return value === true || value === false
}

export function isIndexFirstInArray(index: number): boolean {
  return index === 0
}

export function isIndexLastInArray<T = unknown>(index: number, array: T[]): boolean {
  return index === array.length - 1
}
