import type { Pipeable, SideEffect } from './types'

export const callBoth =
  <A, R = void>(f1: ((a: A) => R) | (() => R), f2: ((a: A) => R) | (() => R)): ((v?: A) => void) =>
  v => {
    f1(v as A)
    f2(v as A)
  }

export const callAll =
  <A>(...fns: ((a: A) => unknown)[]): ((value: A) => void) =>
  v => {
    for (const fn of fns) fn(v)
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
