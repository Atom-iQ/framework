import { setImmediate, clearImmediate } from './utils/immediate'
import { AsyncAction, AsyncScheduler } from './async'

export class AsapScheduler extends AsyncScheduler {
  flush(action?: AsyncAction<unknown>): void {
    this.a = true

    const flushId = this.i
    this.i = null

    const actions = this.q
    let error: Error | undefined
    action = action || actions.shift()!

    do {
      if ((error = action.exec(action.v, action.d))) {
        break
      }
    } while ((action = actions[0]) && action.i === flushId && actions.shift())

    this.a = false

    if (error) {
      while ((action = actions[0]) && action.i === flushId && actions.shift()) {
        action.unsubscribe()
      }
      throw error
    }
  }
}

export class AsapAction<T> extends AsyncAction<T> {
  constructor(scheduler: AsapScheduler, work: (this: AsyncAction<T>, state?: T) => void) {
    super(scheduler, work)
  }

  protected requestId(
    scheduler: AsapScheduler,
    id: number | null,
    delay: number | null = 0
  ): number | null {
    // If delay is greater than 0, request as an async action.
    if (delay !== null && delay > 0) {
      return super.requestId(scheduler, id, delay)
    }
    // Push the action to the end of the scheduler queue.
    scheduler.q.push(this as AsyncAction<unknown>)
    // If a microtask has already been scheduled, don't schedule another
    // one. If a microtask hasn't been scheduled yet, schedule one now. Return
    // the current scheduled microtask id.
    return scheduler.i || (scheduler.i = setImmediate(() => scheduler.flush(undefined)))
  }
  protected recycleId(
    scheduler: AsapScheduler,
    id: number | null,
    delay: number | null = 0
  ): number | null {
    // If delay exists and is greater than 0, or if the delay is null (the
    // action wasn't rescheduled) but was originally scheduled as an async
    // action, then recycle as an async action.
    if ((delay != null && delay > 0) || (delay == null && this.d! > 0)) {
      return super.recycleId(scheduler, id, delay)
    }
    // If the scheduler queue has no remaining actions with the same async id,
    // cancel the requested microtask and set the scheduled flag to undefined
    // so the next AsapAction will request its own.
    if (!scheduler.q.some(action => action.i === id)) {
      clearImmediate(id!)
      scheduler.i = null
    }
    // Return undefined so the action knows to request a new async id if it's rescheduled.
    return null
  }
}

export const asapScheduler = new AsapScheduler(AsapAction)
