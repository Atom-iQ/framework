import { isFunction, noop, withRest } from '@atom-iq/fx';
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

export interface UseProvideRef {
  (initRef?: InitRef | never): void
}

export const useProvideRef: UseProvideRef = initRef => provideRef(initRef, hookComponentNode())

export interface UseProvideRefFactory {
  (): UseProvideRef
}

export const useProvideRefFactory: UseProvideRefFactory = () =>
  withRest(provideRef, hookComponentNode())

function provideRef(initRef: InitRef | never, rvdComponent: RvdComponentNode): void {
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
