import type { RvdComponentElement, ComponentRef } from '@atom-iq/core'
import type { AttachRefMiddlewareProp } from './types'

export const componentRefMiddleware = (
  rvdComponent: RvdComponentElement
): AttachRefMiddlewareProp => {
  if (rvdComponent.ref) {
    const ref: ComponentRef = {
      props: rvdComponent.props,
      state: {},
      functions: {}
    }
    return callback => {
      rvdComponent.ref(callback(ref))
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return _ => null
}
