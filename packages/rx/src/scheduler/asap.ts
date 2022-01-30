import { SchedulerAction } from '../types'

import { setImmediate, clearImmediate } from './utils/immediate'
import { AsyncAction, AsyncScheduler } from './async'

export class AsapScheduler extends AsyncScheduler {
  _id: number | undefined

  flush(action?: AsyncAction<unknown>): void {
    this.active = true

    const flushId = this._id
    this._id = undefined

    const { actions } = this
    let error: Error | undefined
    action = action || actions.shift()!

    do {
      if ((error = action.execute(action.state, action.delay))) {
        break
      }
    } while ((action = actions[0]) && action.id === flushId && actions.shift())

    this.active = false

    if (error) {
      while ((action = actions[0]) && action.id === flushId && actions.shift()) {
        action.unsubscribe()
      }
      throw error
    }
  }
}

export class AsapAction<T> extends AsyncAction<T> {
  constructor(scheduler: AsapScheduler, work: (this: SchedulerAction<T>, state?: T) => void) {
    super(scheduler, work)
  }

  protected requestAsyncId(scheduler: AsapScheduler, id?: number, delay = 0): number | undefined {
    // If delay is greater than 0, request as an async action.
    if (delay !== null && delay > 0) {
      return super.requestAsyncId(scheduler, id, delay)
    }
    // Push the action to the end of the scheduler queue.
    scheduler.actions.push(this as AsyncAction<unknown>)
    // If a microtask has already been scheduled, don't schedule another
    // one. If a microtask hasn't been scheduled yet, schedule one now. Return
    // the current scheduled microtask id.
    return scheduler._id || (scheduler._id = setImmediate(() => scheduler.flush(undefined)))
  }
  protected recycleAsyncId(scheduler: AsapScheduler, id?: number, delay = 0): number | undefined {
    // If delay exists and is greater than 0, or if the delay is null (the
    // action wasn't rescheduled) but was originally scheduled as an async
    // action, then recycle as an async action.
    if ((delay != null && delay > 0) || (delay == null && this.delay! > 0)) {
      return super.recycleAsyncId(scheduler, id, delay)
    }
    // If the scheduler queue has no remaining actions with the same async id,
    // cancel the requested microtask and set the scheduled flag to undefined
    // so the next AsapAction will request its own.
    if (!scheduler.actions.some(action => action.id === id)) {
      clearImmediate(id!)
      scheduler._id = undefined
    }
    // Return undefined so the action knows to request a new async id if it's rescheduled.
    return undefined
  }
}

export const asapScheduler = new AsapScheduler(AsapAction)
