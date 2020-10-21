import type { RvdComponentElement, RvdContext, RvdContextFieldUnion } from '@atom-iq/core'
import type { ContextMiddlewareProp } from './types'

export const useContextMiddleware = (
  rvdComponentElement: RvdComponentElement,
  context: RvdContext
): ContextMiddlewareProp => {
  return <T extends RvdContextFieldUnion>(fieldName: string): T => {
    return context[fieldName] as T
  }
}
