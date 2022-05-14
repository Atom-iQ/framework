import {
  ParentSubscription,
  Subscription,
  teardownSub,
  Unsubscribable,
  isSubscription,
  unsubscribableSub,
  isUnsubscribable
} from '@atom-iq/rx'
import { isFunction, withRest } from '@atom-iq/fx'

import { hookComponentNode } from './manager'

export interface UseSubscription {
  (): ParentSubscription
}

export const useSubscription: UseSubscription = () => hookComponentNode().sub

export type Teardown = (() => void) | Subscription | Unsubscribable

export interface UseTeardown {
  (teardown: Teardown | null | undefined): void
}

export const useTeardown: UseTeardown = teardown => addTeardown(teardown, useSubscription())

export interface UseTeardownFactory {
  (): UseTeardown
}

export const useTeardownFactory: UseTeardownFactory = () => withRest(addTeardown, useSubscription())

function addTeardown(teardown: Teardown, sub: ParentSubscription): void {
  if (isSubscription(teardown)) sub.add(teardown)
  else if (isUnsubscribable(teardown)) sub.add(unsubscribableSub(teardown))
  else if (isFunction(teardown)) sub.add(teardownSub(teardown))
}
