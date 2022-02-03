import { GenericPipeable, InferPipelineResult, Pipe, Pipeable, Predicate } from './types'

export const pipe: Pipe = <A, F extends GenericPipeable[], R extends InferPipelineResult<A, F>>(
  ...fns: F
): Pipeable<A, R> => pipeFromArray(fns)

export const pipeUntil =
  <A, R>(p: Predicate<A | R>, ...fns: GenericPipeable[]): Pipeable<A, R> =>
  v => {
    for (const fn of fns) {
      v = fn(v)
      if (p(v)) return v as unknown as R
    }
    return v as unknown as R
  }

export const pipeWhile =
  <A, R>(p: Predicate<A | R>, ...fns: GenericPipeable[]): Pipeable<A, R> =>
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
