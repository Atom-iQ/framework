import {
  Compose,
  GenericPipeable,
  InferComposedResult,
  Pipeable,
  Predicate,
  SideEffect
} from './types'

export const compose: Compose = <
  A,
  F extends GenericPipeable[],
  R extends InferComposedResult<A, F>
>(
  ...fns: F
): Pipeable<A, R> => composeFromArray(fns)

export const composeFromArray =
  <A, F extends GenericPipeable[], R extends InferComposedResult<A, F>>(
    fns: GenericPipeable[]
  ): Pipeable<A, R> =>
  v => {
    for (let i = fns.length - 1; i >= 0; --i) v = fns[i](v)
    return v as unknown as R
  }

export const composeBoth =
  <A, B, C>(f1: (b: B) => C, f2: (a: A) => B): ((x: A) => C) =>
  v =>
    f1(f2(v))

export const callBoth =
  <A>(f1: (a: A) => unknown, f2: (a: A) => unknown): ((v: A) => void) =>
  v => {
    f1(v)
    f2(v)
  }

export const callAll =
  <A>(...fns: ((a: A) => unknown)[]): ((value: A) => void) =>
  v => {
    for (const fn of fns) fn(v)
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

export const tap =
  <A>(f: SideEffect<A>): Pipeable<A, A> =>
  v => {
    f(v)
    return v
  }

export const tapAll =
  <A>(...fns: SideEffect<A>[]): Pipeable<A, A> =>
  v => {
    for (const fn of fns) fn(v)
    return v
  }

export const fxIf =
  <A, B, C>(p: Predicate<A>, t: Pipeable<A, B>, f?: Pipeable<A, C>): Pipeable<A, B | C | void> =>
  v => {
    if (p(v)) return t(v)
    if (f) return f(v)
  }
