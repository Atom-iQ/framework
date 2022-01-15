import { Action, timestampProvider } from './scheduler'
import { SchedulerAction, SchedulerLike, Subscription } from '../types'
import { arrRemove } from '../utils'

type SetIntervalFunction = (handler: () => void, timeout?: number, ...args: unknown[]) => number

export class AsyncScheduler implements SchedulerLike {
  private Action: typeof AsyncAction
  public now: () => number
  public actions: Array<AsyncAction<unknown>>
  protected active: boolean

  constructor(Action: typeof AsyncAction, now: () => number = timestampProvider.now) {
    this.active = false
    this.actions = []
    this.Action = Action
    this.now = now
  }

  schedule<T>(
    work: (this: SchedulerAction<T>, state?: T) => void,
    delay = 0,
    state?: T
  ): Subscription {
    return new this.Action<T>(this, work).schedule(state, delay)
  }

  flush(action: AsyncAction<unknown>): void {
    const { actions } = this

    if (this.active) {
      actions.push(action)
      return
    }

    let error: Error | undefined
    this.active = true

    do {
      if ((error = action.execute(action.state, action.delay))) {
        break
      }
    } while ((action = actions.shift()!)) // exhaust the scheduler queue

    this.active = false

    if (error) {
      while ((action = actions.shift()!)) {
        action.unsubscribe()
      }
      throw error
    }
  }
}

export class AsyncAction<T> extends Action<T> {
  public id: number | undefined
  public state?: T
  public delay: number | null | undefined
  protected pending: boolean
  protected scheduler: AsyncScheduler
  protected work: (this: SchedulerAction<T>, state?: T) => void

  constructor(scheduler: AsyncScheduler, work: (this: SchedulerAction<T>, state?: T) => void) {
    super(scheduler, work)
    this.scheduler = scheduler
    this.work = work
    this.pending = false
  }

  public schedule(state?: T, delay = 0): Subscription {
    if (!this.active) {
      return this
    }

    this.state = state

    const id = this.id
    const scheduler = this.scheduler

    if (id != null) {
      this.id = this.recycleAsyncId(scheduler, id, delay)
    }

    // Set the pending flag indicating that this action has been scheduled, or
    // has recursively rescheduled itself.
    this.pending = true

    this.delay = delay
    // If this action has already an async Id, don't request a new one.
    this.id = this.id || this.requestAsyncId(scheduler, this.id, delay)

    return this
  }

  protected requestAsyncId(scheduler: AsyncScheduler, _id?: number, delay = 0): number | undefined {
    return (setInterval as SetIntervalFunction)(
      () => scheduler.flush(this as AsyncAction<unknown>),
      delay!
    )
  }

  protected recycleAsyncId(
    _scheduler: AsyncScheduler,
    id?: number,
    delay: number | null = 0
  ): number | undefined {
    // If this action is rescheduled with the same delay time, don't clear the interval id.
    if (delay != null && this.delay === delay && !this.pending) {
      return id
    }
    // Otherwise, if the action's delay time is different from the current delay,
    // or the action has been rescheduled before it's executed, clear the interval id
    clearInterval(id!)
    return undefined
  }

  public execute(state: T, delay?: number | null): Error | undefined {
    if (!this.active) {
      return new Error('executing a cancelled action')
    }

    this.pending = false
    const error = this._execute(state, delay)
    if (error) {
      return error
    } else if (!this.pending && this.id != null) {
      // Dequeue if the action didn't reschedule itself. Don't call
      // unsubscribe(), because the action could reschedule later.
      this.id = this.recycleAsyncId(this.scheduler, this.id, null)
    }
  }

  protected _execute(state: T, _delay?: number | null): Error | undefined {
    let errored = false
    let errorValue: Error
    try {
      this.work(state)
    } catch (e) {
      errored = true
      // HACK: Since code elsewhere is relying on the "truthiness" of the
      // return here, we can't have it return "" or 0 or false.
      // TODO: Clean this up when we refactor schedulers mid-version-8 or so.
      errorValue = e ? (e as Error) : new Error('Scheduled action threw falsy error')
    }
    if (errored) {
      this.unsubscribe()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return errorValue
    }
  }

  unsubscribe(): void {
    if (this.active) {
      const { id, scheduler } = this
      const { actions } = scheduler

      this.work = this.state = this.scheduler = null!
      this.pending = false

      arrRemove(actions, this as AsyncAction<unknown>)
      if (id != null) {
        this.id = this.recycleAsyncId(scheduler, id, null)
      }

      this.delay = null!
    }
  }
}

export const asyncScheduler = new AsyncScheduler(AsyncAction)
