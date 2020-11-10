import type { WithRxSub } from '../../../shared/types'

export function unsubscribe(withSub: WithRxSub): void {
  if (withSub.subscription) {
    withSub.subscription.unsubscribe()
  }
}
