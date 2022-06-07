import { isFunction, noop, withRest } from '@atom-iq/fx'
import { teardownSub } from '@atom-iq/rx'

import type { AnyRef, RvdComponentRef,  RvdComponentNode, RvdRefObject } from 'types'

import { hookComponentNode } from './manager'

/**
 * Create Ref interface
 */
export interface CreateRef {
  <R extends AnyRef = AnyRef>(): RvdRefObject<R>
  <R extends AnyRef = AnyRef>(onConnect: RvdRefObject<R>['onConnect']): RvdRefObject<R>
}

/**
 * Create Ref
 *
 * Create empty ref object
 * @param onConnect
 */
export const createRef: CreateRef = (
  onConnect = noop as RvdRefObject['onConnect']
) => ({ onConnect, current: null })

type InitRefCallback = (ref: RvdComponentRef) => RvdComponentRef
type InitRef = Partial<RvdComponentRef> | InitRefCallback

/**
 * Use Provide Ref hook interface
 */
export interface UseProvideRef {
  (initRef?: InitRef | never): void
}

/**
 * Use Provide Ref hook
 *
 * Share component internal functions, state and props as ref.
 * Only components with provided ref could be referenced.
 * @param initRef
 */
export const useProvideRef: UseProvideRef = initRef => provideRef(initRef, hookComponentNode())

/**
 * Use Provide Ref Factory hook interface
 */
export interface UseProvideRefFactory {
  (): UseProvideRef
}

/**
 * Use Provide Ref Factory Hook
 *
 * Get function that share component internal functions, state and props as ref.
 * Result function could be used in async operations in component
 */
export const useProvideRefFactory: UseProvideRefFactory = () =>
  withRest(provideRef, hookComponentNode())

function provideRef(initRef: InitRef | never, rvdComponent: RvdComponentNode): void {
  const ref = rvdComponent.ref

  if (ref) {
    const providedRef: RvdComponentRef = {
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
