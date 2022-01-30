import type { RvdComponentNode, ComponentRef, RvdRefObjectWithObservable } from '@atom-iq/core'

import type { ShareRefMiddleware } from './types'

export const componentRefMiddleware = (rvdComponent: RvdComponentNode): ShareRefMiddleware => {
  if (rvdComponent.ref) {
    const ref: ComponentRef = {
      props: rvdComponent.props,
      state: {},
      functions: {}
    }
    return (refOrCallback: ComponentRef | ((ref: ComponentRef) => ComponentRef)): void => {
      rvdComponent.ref.current =
        typeof refOrCallback === 'function' ? refOrCallback(ref) : { ...ref, ...refOrCallback }
      if ((rvdComponent.ref as RvdRefObjectWithObservable<ComponentRef>).__subject) {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;(rvdComponent.ref as RvdRefObjectWithObservable<ComponentRef>).__subject.next(
          rvdComponent.ref.current
        )
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return _ => null
}
