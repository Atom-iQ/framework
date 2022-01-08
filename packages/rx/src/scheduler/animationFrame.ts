import { AsyncScheduler, AsyncAction } from './async'
import { SchedulerAction } from '../types'

export class AnimationFrameScheduler extends AsyncScheduler {
  _id: number | undefined
  public flush(action?: AsyncAction<unknown>): void {
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

export class AnimationFrameAction<T> extends AsyncAction<T> {
  constructor(
    protected scheduler: AnimationFrameScheduler,
    protected work: (this: SchedulerAction<T>, state?: T) => void
  ) {
    super(scheduler, work)
  }

  protected requestAsyncId(
    scheduler: AnimationFrameScheduler,
    id?: number,
    delay: number | null = 0
  ): number | undefined {
    // If delay is greater than 0, request as an async action.
    if (delay !== null && delay > 0) {
      return super.requestAsyncId(scheduler, id, delay)
    }
    // Push the action to the end of the scheduler queue.
    scheduler.actions.push(this as AsyncAction<unknown>)
    // If an animation frame has already been requested, don't request another
    // one. If an animation frame hasn't been requested yet, request one. Return
    // the current animation frame request id.
    return (
      scheduler._id || (scheduler._id = requestAnimationFrame(() => scheduler.flush(undefined)))
    )
  }
  protected recycleAsyncId(
    scheduler: AnimationFrameScheduler,
    id?: number,
    delay: number | null = 0
  ): number | undefined {
    // If delay exists and is greater than 0, or if the delay is null (the
    // action wasn't rescheduled) but was originally scheduled as an async
    // action, then recycle as an async action.
    if ((delay != null && delay > 0) || (delay == null && this.delay! > 0)) {
      return super.recycleAsyncId(scheduler, id, delay)
    }
    // If the scheduler queue has no remaining actions with the same async id,
    // cancel the requested animation frame and set the scheduled flag to
    // undefined so the next AnimationFrameAction will request its own.
    if (!scheduler.actions.some(action => action.id === id)) {
      cancelAnimationFrame(id!)
      scheduler._id = undefined
    }
    // Return undefined so the action knows to request a new async id if it's rescheduled.
    return undefined
  }
}

/**
 *
 * Animation Frame Scheduler
 *
 * <span class="informal">Perform task when `window.requestAnimationFrame` would fire</span>
 *
 * When `animationFrame` scheduler is used with delay, it will fall back to {@link asyncScheduler} scheduler
 * behaviour.
 *
 * Without delay, `animationFrame` scheduler can be used to create smooth browser animations.
 * It makes sure scheduled task will happen just before next browser content repaint,
 * thus performing animations as efficiently as possible.
 *
 * ## Example
 * Schedule div height animation
 * ```ts
 * // html: <div style="background: #0ff;"></div>
 * import { animationFrameScheduler } from 'rxjs';
 *
 * const div = document.querySelector('div');
 *
 * animationFrameScheduler.schedule(function(height) {
 *   div.style.height = height + "px";
 *
 *   this.schedule(height + 1);  // `this` references currently executing Action,
 *                               // which we reschedule with new state
 * }, 0, 0);
 *
 * // You will see a div element growing in height
 * ```
 */
export const animationFrameScheduler = new AnimationFrameScheduler(AnimationFrameAction)
