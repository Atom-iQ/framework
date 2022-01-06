import type { WithRxSub } from 'types'
import { Observable, SchedulerAction, Subscription } from 'rxjs'

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

export function isObservable<T>(obj: unknown): obj is Observable<T> {
  return !!(obj && (obj as Observable<T>).subscribe)
}
