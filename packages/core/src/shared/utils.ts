/**
 * @function isArray
 */
import { AtomiqContext, FunctionType, RvdContext } from 'types'

export const isArray = Array.isArray

export function isStringOrNumber(value: unknown): value is string | number {
  const type = typeof value

  return type === 'string' || type === 'number'
}

export function isNullOrUndef(value: unknown): value is undefined | null {
  return value === void 0 || value === null
}

export function isFunction<FnType extends FunctionType = FunctionType>(
  value: unknown
): value is FnType {
  return typeof (value as FnType) === 'function'
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isBoolean(value: unknown): value is boolean {
  return value === true || value === false
}

export function arrayEvery<T>(array: T[], predicate: (item: T, index: number) => boolean): boolean {
  for (let i = 0; i < array.length; ++i) {
    if (!predicate(array[i], i)) return false
  }
  return true
}

export function arrayReduce<T, R>(
  array: T[],
  callback: (accumulator: R, current: T, index: number) => R,
  initial: R
): R {
  let result = initial
  for (let i = 0; i < array.length; ++i) result = callback(result, array[i], i)
  return result
}

export function atomiqContext(context: RvdContext): AtomiqContext {
  return context.__iq__
}
