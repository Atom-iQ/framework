import { GenericPipeable, InferPipelineResult, Pipeline } from './types'
import { pipeFromArray } from './pipe'

export const pipeline: Pipeline = <
  A,
  F extends GenericPipeable[],
  R extends InferPipelineResult<A, F>
>(
  value: A,
  ...fns: F
): R => pipeFromArray<A, F, R>(fns)(value)
