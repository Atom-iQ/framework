/**
 * @function isArray
 */
import { Dictionary } from './types/common'

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

export function loop(size: number, callback: (index: number) => void, startingIndex = 0): void {
  if (!size) return
  size = size + startingIndex
  for (let i = startingIndex; i < size; ++i) callback(i)
}

export function arrayLoop<T>(array: T[], callback: (element: T, index: number) => void): void {
  const size = array.length
  if (!size) return
  for (let i = 0; i < size; ++i) callback(array[i], i)
}

export function arrayReduce<T, R>(
  array: T[],
  callback: (all: R, current: T, index: number) => R,
  initial: R
): R {
  const size = array.length
  if (!size) return initial
  let result = initial
  for (let i = 0; i < size; ++i) result = callback(result, array[i], i)
  return result
}

export function objectLoop<T extends {}>(
  object: T,
  callback: (value: T[Extract<keyof T, string>], key: keyof T) => void
): void {
  for (const key in object) callback(object[key], key)
}
