import { ComponentRef, RvdRefObject } from 'types'
import { isFunction } from '@atom-iq/fx'

import { hookComponentNode } from './manager'

type InitRefCallback = (ref: ComponentRef) => ComponentRef

export interface UseProvideRefHook {
  (initRef?: Partial<ComponentRef> | InitRefCallback | never): void
}

export const useProvideRef: UseProvideRefHook = (initRef?): void => {
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

export interface UseProvideRefFactoryHook {
  (): (initRef?: Partial<ComponentRef> | InitRefCallback | never) => void
}

export const useProvideRefFactory: UseProvideRefFactoryHook = (): ((
  initRef?: Partial<ComponentRef> | InitRefCallback | never
) => void) => {
  const rvdComponent = hookComponentNode()

  return (initRef?: Partial<ComponentRef> | InitRefCallback | never) => {
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
}
