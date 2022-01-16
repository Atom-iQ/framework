import { Observer, SchedulerAction, Subscription } from '@atom-iq/rx'

import type { WithRxSub } from 'types'

/**
 * Get object with `subscription` property and unsubscribe it
 *
 * @param withSub object with subscription
 */
export function unsubscribe(withSub: WithRxSub): void {
  if (withSub.sub) {
    withSub.sub.unsubscribe()
  }
}

export function unsubscribeAsync(
  this: SchedulerAction<Subscription[]>,
  toUnsubscribe: Subscription[]
): void {
  for (const sub of toUnsubscribe) sub.unsubscribe()
}

export abstract class AtomiqObserver<T> implements Observer<T> {
  abstract next(v: T): void
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  error(): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  complete(): void {}
}
