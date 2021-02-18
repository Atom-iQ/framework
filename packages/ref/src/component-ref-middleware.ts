import type { RvdComponentNode, ComponentRef } from '@atom-iq/core'
import type { AttachRefMiddlewareProp } from './types'

export const componentRefMiddleware = (rvdComponent: RvdComponentNode): AttachRefMiddlewareProp => {
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
