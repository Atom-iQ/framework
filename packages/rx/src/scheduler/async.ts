import { SchedulerAction, Scheduler, Subscription, ParentSubscription } from '../types'
import { arrRemove } from '../utils'
import { GroupSub } from '../subscription'

import { timestampProvider } from './utils/providers'

type SetIntervalFunction = (handler: () => void, timeout?: number, ...args: unknown[]) => number

export class AsyncScheduler implements Scheduler {
  private readonly A: typeof AsyncAction
  /**
   * _q - queue
   *
   * queue of scheduled actions
   * @internal do not use
   */
  public readonly q: Array<AsyncAction<unknown>>
  /** a - active */
  protected a: boolean
  public i: number | null

  constructor(Action: typeof AsyncAction, now?: () => number) {
    this.a = false
    this.q = []
    this.A = Action
    this.i = null
    if (now) this.now = now
  }

  now(): number {
    return timestampProvider.now()
  }

  schedule<T>(work: (this: AsyncAction<T>, state?: T) => void, delay = 0, state?: T): Subscription {
    return new this.A<T>(this, work).schedule(state, delay)
  }

  flush(action: AsyncAction<unknown>): void {
    const actions = this.q

    if (this.a) {
      actions.push(action)
      return
    }

    let error: Error | undefined
    this.a = true

    do {
      if ((error = action.exec(action.v, action.d))) {
        break
      }
    } while ((action = actions.shift()!)) // exhaust the scheduler queue

    this.a = false

    if (error) {
      while ((action = actions.shift()!)) {
        action.unsubscribe()
      }
      throw error
    }
  }
}

export class AsyncAction<T>
  extends GroupSub
  implements SchedulerAction<T>, ParentSubscription, Subscription
{
  public i: number | null
  /** v - value - current action state */
  public v?: T
  /** d - delay - action delay */
  public d: number | null
  /** _p - pending  */
  protected _p: boolean
  /** _s - scheduler */
  protected _s: AsyncScheduler
  /** w - work */
  protected w: (this: AsyncAction<T>, state?: T) => void

  constructor(scheduler: AsyncScheduler, work: (this: AsyncAction<T>, state?: T) => void) {
    super()
    this._s = scheduler
    this.w = work
    this._p = false
    this.i = this.d = null
  }

  public schedule(state?: T, delay = 0): Subscription {
    if (!this.a) {
      return this
    }

    this.v = state

    const id = this.i
    const scheduler = this._s

    if (id != null) {
      this.i = this.recycleId(scheduler, id, delay)
    }

    // Set the pending flag indicating that this action has been scheduled, or
    // has recursively rescheduled itself.
    this._p = true

    this.d = delay
    // If this action has already an async Id, don't request a new one.
    this.i = this.i || this.requestId(scheduler, this.i, delay)

    return this
  }

  protected requestId(
    scheduler: AsyncScheduler,
    id: number | null,
    delay: number | null = 0
  ): number | null {
    return (setInterval as SetIntervalFunction)(
      () => scheduler.flush(this as AsyncAction<unknown>),
      delay!
    )
  }

  protected recycleId(
    _scheduler: AsyncScheduler,
    id: number | null,
    delay: number | null = 0
  ): number | null {
    // If this action is rescheduled with the same delay time, don't clear the interval id.
    if (delay != null && this.d === delay && !this._p) return id

    // Otherwise, if the action's delay time is different from the current delay,
    // or the action has been rescheduled before it's executed, clear the interval id
    clearInterval(id!)
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public exec(state: T, delay: number | null): Error | undefined {
    if (!this.a) return new Error('executing a cancelled action')

    this._p = false
    const error = this._exec(state)
    if (error) {
      return error
    } else if (!this._p && this.i != null) {
      // Dequeue if the action didn't reschedule itself. Don't call
      // unsubscribe(), because the action could reschedule later.
      this.i = this.recycleId(this._s, this.i, null)
    }
  }

  protected _exec(state: T): Error | undefined {
    try {
      this.w(state)
    } catch (e) {
      this.unsubscribe()
      return e as Error
    }
  }

  unsubscribe(): void {
    if (this.a) {
      this.a = false
      this.removeFromParents()

      const id = this.i
      const scheduler = this._s
      const actions = scheduler.q

      this.w = this.v = this._s = null!
      this._p = false

      arrRemove(actions, this as AsyncAction<unknown>)
      if (id != null) {
        this.i = this.recycleId(scheduler, id, null)
      }

      this.d = null!
      if (this.s.length) this.unsubscribeChildren()
    }
  }
}

export const asyncScheduler = new AsyncScheduler(AsyncAction)
