import { ComponentRef } from 'types'
import { isFunction } from '@atom-iq/fx'

import { hookComponentNode } from './manager'

type InitRefCallback = (ref: ComponentRef) => ComponentRef

export const useProvideRef = (initRef?: Partial<ComponentRef> | InitRefCallback): void => {
  const rvdComponent = hookComponentNode()

  const ref = rvdComponent.ref

  if (ref) {
    const providedRef: ComponentRef = {
      props: rvdComponent.props
    }

    ref.onConnect(
      (ref.current = !initRef
        ? providedRef
        : isFunction(initRef)
        ? initRef(providedRef)
        : Object.assign(providedRef, initRef))
    )
  }
}
