import { isFunction, noop } from '@atom-iq/fx';
import { teardownSub } from '@atom-iq/rx';

import { AnyRef, ComponentRef,  RvdComponentNode, RvdRefObject } from 'types';

import { hookComponentNode } from './manager'

export interface CreateRef {
  <R extends AnyRef = AnyRef>(): RvdRefObject<R>
  <R extends AnyRef = AnyRef>(onConnect: RvdRefObject<R>['onConnect']): RvdRefObject<R>
}

export const createRef: CreateRef = (
  onConnect = noop as RvdRefObject['onConnect']
) => ({ onConnect, current: null })

type InitRefCallback = (ref: ComponentRef) => ComponentRef

type InitRef = Partial<ComponentRef> | InitRefCallback

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

    rvdComponent.sub.add(teardownSub(() => {
      ref.current = null
    }))
  }
}

export interface UseProvideRefHook {
  (initRef?: InitRef | never): void
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
