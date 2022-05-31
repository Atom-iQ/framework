import type {
  GenericPipeable,
  Head,
  InferPipelineResult,
  Pipe,
  Pipeable,
  Predicate
} from './types';

export const pipe: Pipe = <A, F extends GenericPipeable[], R extends InferPipelineResult<A, F>>(
  ...fns: F
): Pipeable<A, R> => pipeFromArray(fns)

export type PipePredicate<A, F extends GenericPipeable[]> = Predicate<A | Head<Parameters<F[number]>>>

export const pipeUntil =
  <A, F extends GenericPipeable[], R>(p: PipePredicate<A, F>, ...fns: F): Pipeable<A, R> =>
  v => {
    for (const fn of fns) {
      if (p(v)) return v as unknown as R
      v = fn(v)
    }
    return v as unknown as R
  }

export const pipeWhile =
  <A, F extends GenericPipeable[], R>(p: PipePredicate<A, F>, ...fns: F): Pipeable<A, R> =>
  v => {
    for (const fn of fns) {
      if (!p(v)) return v as unknown as R
      v = fn(v)
    }
    return v as unknown as R
  }

export const pipeFromArray =
  <A, F extends GenericPipeable[], R extends InferPipelineResult<A, F>>(fns: F): Pipeable<A, R> =>
  v => {
    for (const fn of fns) v = fn(v)
    return v as R
  }
