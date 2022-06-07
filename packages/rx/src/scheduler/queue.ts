import { Subscription } from '../types'

import { AsyncAction, AsyncScheduler } from './async'

export class QueueScheduler extends AsyncScheduler {}

export class QueueAction<T> extends AsyncAction<T> {
  constructor(scheduler: QueueScheduler, work: (this: AsyncAction<T>, state?: T) => void) {
    super(scheduler, work)
  }

  public schedule(state?: T, delay = 0): Subscription {
    if (delay > 0) {
      return super.schedule(state, delay)
    }
    this.d = delay
    this.v = state
    this._s.flush(this as AsyncAction<unknown>)
    return this
  }

  public exec(state: T, delay: number): Error | undefined {
    return delay > 0 || !this.a ? super.exec(state, delay) : this._exec(state)
  }

  protected requestId(
    scheduler: QueueScheduler,
    id: number | null,
    delay: number | null = 0
  ): number | null {
    // If delay exists and is greater than 0, or if the delay is null (the
    // action wasn't rescheduled) but was originally scheduled as an async
    // action, then recycle as an async action.

    if ((delay != null && delay > 0) || (delay == null && this.d! > 0)) {
      return super.requestId(scheduler, id, delay)
    }
    // Otherwise flush the scheduler starting with this action.
    scheduler.flush(this as AsyncAction<unknown>)
    return null
  }
}

export const queueScheduler = new QueueScheduler(QueueAction)
