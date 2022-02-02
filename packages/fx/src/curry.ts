import {
  Curried,
  Curried1,
  Curried1Result,
  Curried2,
  Curried2Result,
  Curried3,
  Curried3Result,
  Curried4,
  Curried4Result
} from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const curry = <F extends (...args: any[]) => any>(f: F): Curried<F> => {
  switch (f.length) {
    case 1:
      return curry1(f) as Curried<F>
    case 2:
      return curry2(f) as Curried<F>
    case 3:
      return curry3(f) as Curried<F>
    case 4:
      return curry4(f) as Curried<F>
    default:
      return f as Curried<F>
  }
}

export function curry1<A, B>(f: (a: A) => B): Curried1<A, B> {
  function curried(a: A): Curried1Result<A, B> {
    if (arguments.length === 0) return curried as Curried1<A, B>
    else return f(a)
  }
  return curried as Curried1<A, B>
}

export function curry2<A, B, C>(f: (a: A, b: B) => C): Curried2<A, B, C> {
  function curried(a: A, b: B): Curried2Result<A, B, C> {
    switch (arguments.length) {
      case 0:
        return curried as Curried2<A, B, C>
      case 1:
        return (b: B) => f(a, b)
      default:
        return f(a, b)
    }
  }
  return curried as Curried2<A, B, C>
}

export function curry3<A, B, C, D>(f: (a: A, b: B, c: C) => D): Curried3<A, B, C, D> {
  function curried(a: A, b: B, c: C): Curried3Result<A, B, C, D> {
    switch (arguments.length) {
      case 0:
        return curried as Curried3<A, B, C, D>
      case 1:
        return curry2((b: B, c: C) => f(a, b, c))
      case 2:
        return (c: C) => f(a, b, c)
      default:
        return f(a, b, c)
    }
  }
  return curried as Curried3<A, B, C, D>
}

export function curry4<A, B, C, D, E>(f: (a: A, b: B, c: C, d: D) => E): Curried4<A, B, C, D, E> {
  function curried(a: A, b: B, c: C, d: D): Curried4Result<A, B, C, D, E> {
    switch (arguments.length) {
      case 0:
        return curried as Curried4<A, B, C, D, E>
      case 1:
        return curry3((b: B, c: C, d: D) => f(a, b, c, d))
      case 2:
        return curry2((c: C, d: D) => f(a, b, c, d))
      case 3:
        return (d: D) => f(a, b, c, d)
      default:
        return f(a, b, c, d)
    }
  }
  return curried as Curried4<A, B, C, D, E>
}
