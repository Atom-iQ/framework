import { isFunction } from '@atom-iq/fx'

export function arrRemove<T>(arr: T[] | undefined | null, item: T): void {
  if (arr) {
    const index = arr.indexOf(item)
    0 <= index && arr.splice(index, 1)
  }
}

export const isArrayLike = <T>(x: unknown): x is ArrayLike<T> =>
  (x && typeof (x as { length: unknown }).length === 'number' && typeof x !== 'function') as boolean

export function isPromise<T>(x: unknown): x is PromiseLike<T> {
  return (x && typeof (x as { then: unknown }).then === 'function') as boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isIterable<T>(x: any): x is Iterable<T> {
  return isFunction(x?.[Symbol_iterator])
}

export function getSymbolIterator(): symbol {
  if (typeof Symbol !== 'function' || !Symbol.iterator) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return '@@iterator' as any
  }

  return Symbol.iterator
}

export const Symbol_iterator = getSymbolIterator()
