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

/**
 * Use Subscription hook interface
 */
export interface UseSubscription {
  (): ParentSubscription
}

/**
 * Use Subscription hook
 *
 * Get component subscription (unsubscribed when component is removed)
 */
export const useSubscription: UseSubscription = () => hookComponentNode().sub

/**
 * Teardown Type
 *
 * Teardown could be:
 * - function
 * - subscription
 * - unsubscribable (object with unsubscribe() method)
 */
export type Teardown = (() => void) | Subscription | Unsubscribable

/**
 * Use Teardown hook interface
 */
export interface UseTeardown {
  (teardown: Teardown | null | undefined): void
}

/**
 * Use Teardown hook
 *
 * Add given teardown to component subscription (unsubscribed when component is removed).
 * Teardown could be function (called when component is removed),
 * unsubscribable (object with unsubscribe() method) or subscription.
 * @param teardown
 */
export const useTeardown: UseTeardown = teardown => addTeardown(teardown, useSubscription())

/**
 * Use Teardown Factory interface
 */
export interface UseTeardownFactory {
  (): UseTeardown
}

/**
 * Use Teardown Factory hook
 *
 * Get function, that adds given teardown to component subscription (unsubscribed
 * when component is removed).
 * Teardown could be function (called when component is removed),
 * unsubscribable (object with unsubscribe() method) or subscription.
 * Result function could be used in async operations in component.
 */
export const useTeardownFactory: UseTeardownFactory = () => withRest(addTeardown, useSubscription())

function addTeardown(teardown: Teardown, sub: ParentSubscription): void {
  if (isSubscription(teardown)) sub.add(teardown)
  else if (isUnsubscribable(teardown)) sub.add(unsubscribableSub(teardown))
  else if (isFunction(teardown)) sub.add(teardownSub(teardown))
}
