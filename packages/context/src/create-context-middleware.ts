import type { ComponentMiddleware, RvdComponentNode, RvdContext } from '@atom-iq/core'

import type { CreateContextMiddlewareProp } from './types'

export const createContextMiddleware: ComponentMiddleware = (
  rvdComponentElement: RvdComponentNode,
  oldContext: RvdContext
): [CreateContextMiddlewareProp, RvdContext] => {
  const newContext = Object.assign({}, oldContext)

  const createContextFn: CreateContextMiddlewareProp = (fieldName, value) => {
    newContext[fieldName] = value
  }

  return [createContextFn, newContext]
}
