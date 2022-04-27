import { isFunction } from '@atom-iq/fx'

import { ComponentRef, RvdComponentNode } from 'types';

import { hookComponentNode } from './manager'

type InitRefCallback = (ref: ComponentRef) => ComponentRef

type InitRef = Partial<ComponentRef> | InitRefCallback

export interface UseProvideRefHook {
  (initRef?: InitRef | never): void
}

const provideRef = (rvdComponent: RvdComponentNode, initRef?: InitRef | never): void => {
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

export const useProvideRef: UseProvideRefHook = initRef =>
  provideRef(hookComponentNode(), initRef)

export interface UseProvideRefFactoryHook {
  (): (initRef?: InitRef | never) => void
}

export const useProvideRefFactory: UseProvideRefFactoryHook = () => {
  const rvdComponent = hookComponentNode()

  return initRef => provideRef(rvdComponent, initRef)
}
