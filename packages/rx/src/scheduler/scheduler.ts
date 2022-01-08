import type { Subscription, SchedulerLike, SchedulerAction, TimestampProvider } from '../types'
import { ChildSubscription } from '../subscription'

export const timestampProvider: TimestampProvider = {
  now() {
    return (performance || Date).now()
  }
}

export abstract class Action<T> extends ChildSubscription implements SchedulerAction<T> {
  protected constructor(
    protected scheduler: SchedulerLike,
    protected work: (this: SchedulerAction<T>, state?: T) => void
  ) {
    super()
  }
  abstract schedule(state?: T, delay?: number): Subscription
}
