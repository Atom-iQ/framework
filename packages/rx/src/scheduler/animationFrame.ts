import { AsyncScheduler, AsyncAction } from './async'

export class AnimationFrameScheduler extends AsyncScheduler {
  public flush(action?: AsyncAction<unknown>): void {
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

export class AnimationFrameAction<T> extends AsyncAction<T> {
  constructor(scheduler: AnimationFrameScheduler, work: (this: AsyncAction<T>, state?: T) => void) {
    super(scheduler, work)
  }

  protected requestId(
    scheduler: AnimationFrameScheduler,
    id: number | null,
    delay: number | null = 0
  ): number | null {
    // If delay is greater than 0, request as an async action.
    if (delay !== null && delay > 0) {
      return super.requestId(scheduler, id, delay)
    }
    // Push the action to the end of the scheduler queue.
    scheduler.q.push(this as AsyncAction<unknown>)
    // If an animation frame has already been requested, don't request another
    // one. If an animation frame hasn't been requested yet, request one. Return
    // the current animation frame request id.
    return scheduler.i || (scheduler.i = requestAnimationFrame(() => scheduler.flush(undefined)))
  }
  protected recycleId(
    scheduler: AnimationFrameScheduler,
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
    // cancel the requested animation frame and set the scheduled flag to
    // undefined so the next AnimationFrameAction will request its own.
    if (!scheduler.q.some(action => action.i === id)) {
      cancelAnimationFrame(id!)
      scheduler.i = null
    }
    // Return undefined so the action knows to request a new async id if it's rescheduled.
    return null
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
