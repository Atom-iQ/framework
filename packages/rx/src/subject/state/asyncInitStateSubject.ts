import type { Observer, ObservableState, Subscription, Unsubscribable } from '../../types'
import { Subject } from '../subject'
import { EMPTY_SUB, subjectSub } from '../../subscription'
import { unsubscribedError } from '../utils'

/**
 * Async-Init State Subject Factory
 *
 * Create new async-init state subject. In this type of subject every
 * next value is delivered synchronously, but it has no initial value
 */
export const asyncInitStateSubject = <T>(): AsyncInitStateSubject<T> =>
  new AsyncInitStateSubject<T>()

/**
 * Async-Init State Subject
 *
 * This type of subject is almost the same as state subject,
 * but it has no initial value - before its next method is called
 * for the first time, it doesn't emit any value to newly subscribed
 * observers. After first next call, it works like normal state subject.
 * Every next value is delivered synchronously
 */
export class AsyncInitStateSubject<T>
  extends Subject<T>
  implements ObservableState<T>, Unsubscribable
{
  /**
   * s - state
   *
   * Current state value - initially undefined
   */
  private s: T

  /**
   * i - initialized
   *
   * Subject initialization status:
   * - false - not initialized - set in constructor - async-init state subject
   *   has no initial state, so it also has no any saved state and doesn't emit
   *   anything to newly subscribed observers (until initialized)
   * - true - initialized - set in first next call - after calling next, subject
   *   has last state value saved, so it can emit it immediately when subscribing
   *   new observers, just like regular state subject
   */
  private i: boolean

  constructor() {
    super()
    // Set state value to undefined/never - no initial value
    this.s = undefined as never
    // Set initialized status to false
    this.i = false
  }

  /**
   * Subscribe
   *
   * Connects given observer with async-init state subject. If subject is
   * initialized (after its next method was called for the first time),
   * immediately (synchronously) emits current state value
   * @param observer
   */
  subscribe(observer: Observer<T>): Subscription {
    if (this.isStopped(observer)) return EMPTY_SUB

    this.o!.push(observer)
    this.i && observer.next(this.s)
    return subjectSub(this, observer)
  }

  /**
   * Next
   *
   * Save new value as current state and emit it to connected
   * observers. If called for first time, set initialized status
   * to true
   * @param value
   */
  next(value: T): void {
    !this.i && (this.i = true)
    super.next((this.s = value))
  }

  /**
   * v - get value
   *
   * Get current state value synchronously.
   * If there's saved error, rethrow it.
   * If state subject is closed (unsubscribed), throw new error.
   */
  get v(): T {
    if (this.e === true) throw unsubscribedError()
    return this.s
  }

  /**
   * v - set value
   *
   * Emit next value to observers and save value as current state
   * @param v
   */
  set v(v: T) {
    this.next(v)
  }
}
