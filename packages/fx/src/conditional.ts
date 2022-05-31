import type { Pipeable, Predicate } from './types'

export const fxIf =
  <A, B, C>(p: Predicate<A>, t: Pipeable<A, B>, f?: Pipeable<A, C>): Pipeable<A, B | C | void> =>
  v => {
    if (p(v)) return t(v)
    if (f) return f(v)
  }

export const and =
  <A>(f1: Predicate<A>, f2: Predicate<A>): Predicate<A> =>
  v =>
    f1(v) && f2(v)

export const or =
  <A>(f1: Predicate<A>, f2: Predicate<A>): Predicate<A> =>
  v =>
    f1(v) || f2(v)

export const every =
  <A>(...fns: Predicate<A>[]): Predicate<A> =>
  v => {
    for (const fn of fns) {
      if (!fn(v)) return false
    }
    return true
  }

export const some =
  <A>(...fns: Predicate<A>[]): Predicate<A> =>
  v => {
    for (const fn of fns) {
      if (fn(v)) return true
    }
    return false
  }

export const find =
  <A, F extends Pipeable<A, R[number]>[], R extends any[]>(
    p: (result: R[number], argValue: A) => boolean,
    ...fns: F
  ): Pipeable<A, R | undefined> =>
  v => {
    for (const fn of fns) {
      const r = fn(v)
      if (p(r, v)) return r
    }
    return void 0
  }

export const findLast =
  <A, F extends Pipeable<A, R[number]>[], R extends any[]>(
    p: (result: R[number], argValue: A) => boolean,
    ...fns: F
  ): Pipeable<A, R | undefined> =>
  v => {
    let l: R | undefined
    for (const fn of fns) {
      const r = fn(v)
      if (p(r, v)) l = r
    }
    return l
  }
