import type { WithRxSub } from '../../../shared/types'

/**
 * Get object with `subscription` property and unsubscribe it
 *
 * @param withSub object with subscription
 */
export function unsubscribe(withSub: WithRxSub): void {
  if (withSub.subscription) {
    withSub.subscription.unsubscribe()
  }
}
