import type { Subscription, SchedulerLike, SchedulerAction, TimestampProvider } from '../types'
import { ChildSubscription } from '../subscription'

export const timestampProvider: TimestampProvider = {
  now() {
    return (performance || Date).now()
  }
}

export abstract class Action<T> extends ChildSubscription implements SchedulerAction<T> {
  protected scheduler: SchedulerLike
  protected work: (this: SchedulerAction<T>, state?: T) => void

  protected constructor(
    scheduler: SchedulerLike,
    work: (this: SchedulerAction<T>, state?: T) => void
  ) {
    super()
    this.scheduler = scheduler
    this.work = work
  }
  abstract schedule(state?: T, delay?: number): Subscription
}
