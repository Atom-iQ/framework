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

export const useSubscription = (): ParentSubscription => {
  const rvdComponent = hookComponentNode()
  return rvdComponent.sub
}

const addTeardown = (
  teardown: (() => void) | Subscription | Unsubscribable | null | undefined,
  sub: ParentSubscription
): void => {
  if (isFunction(teardown)) sub.add(teardownSub(teardown))
  else if (isSubscription(teardown)) sub.add(teardown)
  else if (isUnsubscribable(teardown)) sub.add(unsubscribableSub(teardown))
}

export const useAddTeardown = (
  teardown: (() => void) | Subscription | Unsubscribable | null | undefined
): void => {
  addTeardown(teardown, useSubscription())
}

export const useAddTeardownFactory = (): typeof useAddTeardown =>
  withRest(addTeardown, useSubscription())
