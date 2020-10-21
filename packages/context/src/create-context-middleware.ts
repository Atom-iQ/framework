import type { ComponentMiddleware, RvdComponentElement, RvdContext } from '@atom-iq/core'
import type { CreateContextMiddlewareProp } from './types'

export const createContextMiddleware: ComponentMiddleware = (
  rvdComponentElement: RvdComponentElement,
  oldContext: RvdContext
): [CreateContextMiddlewareProp, RvdContext] => {
  const newContext = Object.assign({}, oldContext)

  const createContextFn: CreateContextMiddlewareProp = (fieldName, value) => {
    newContext[fieldName] = value
  }

  return [createContextFn, newContext]
}
