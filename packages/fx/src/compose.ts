import type { Compose, GenericPipeable, InferComposedResult, Pipeable } from './types'

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
