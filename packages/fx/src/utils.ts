import { AnyFunction } from './types'

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {}

export function isFunction<F extends AnyFunction = AnyFunction>(x: unknown): x is F {
  return typeof x === 'function'
}
