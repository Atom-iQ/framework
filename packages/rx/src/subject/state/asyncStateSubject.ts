import type {
  Observer,
  Scheduler,
  ObservableState,
  Subscription,
  Unsubscribable,
  ParentSubscription
} from '../../types'
import { Subject } from '../subject'
import { animationFrameScheduler } from '../../scheduler'
import {
  EMPTY_SUB,
  groupSub,
  GroupSub,
  SettableSub,
  settableSub,
  subjectSub
} from '../../subscription'
import { unsubscribedError } from '../utils'

/**
 * Async State Subject Factory
 *
 * Create new state subject. This type of subject always emits its current
 * state value to newly subscribed observers. It has initial value. Every
 * next value is delivered synchronously.
 */
export const asyncStateSubject = <T>(
  initialValue: T,
  debounce = false,
  scheduler?: Scheduler
): AsyncStateSubject<T> => new AsyncStateSubject<T>(initialValue, debounce, scheduler)

/**
 * Async State Subject
 *
 * State subject keeps state internally (with initial value),
 * and always emits its current value to newly subscribed observers
 * Every next value is delivered synchronously
 */
export class AsyncStateSubject<T> extends Subject<T> implements ObservableState<T>, Unsubscribable {
  /**
   * s - state
   *
   * Current state value, initialized with value in constructor
   */
  private s: T

  /**
   * p - pending
   */
  private p: boolean

  /**
   * d - debounce
   */
  private readonly d: boolean

  /**
   * _s - scheduler
   */
  private readonly _s: Scheduler

  /**
   * u - update sub - scheduler action settable subscription
   */
  private u: ParentSubscription | SettableSub

  constructor(initialState: T, debounce = false, scheduler?: Scheduler) {
    super()
    // Set initial state value
    this.s = initialState
    this.p = false
    this.d = debounce
    this._s = scheduler || animationFrameScheduler
    this.u = this.d ? settableSub() : groupSub()
  }

  subscribe(observer: Observer<T>): Subscription {
    if (this.isStopped(observer)) return EMPTY_SUB

    this.o!.push(observer)
    observer.next(this.s)
    return subjectSub(this, observer)
  }

  /**
   * Next
   *
   * Save new value as current state and emit it asynchronously.
   * - when debounce mode is true, schedule one update action and only
   *   save new state on next calls, until action is executed - state
   *   will be updated with last state value in the moment of action execution.
   * - when debounce mode is false, schedule new update action for every single
   *   next call
   * @param value
   */
  next(value: T): void {
    if (this.e === true) throw unsubscribedError()
    if (this.d) {
      this.s = value

      if (!this.p) {
        this.p = true
        const u = this.u as SettableSub
        u.set(
          this._s.schedule(() => {
            this.p = false
            super.next(this.s)
          })
        )
      }
    } else {
      const u = this.u as ParentSubscription
      u.add(this._s.schedule(() => super.next((this.s = value))))
    }
  }

  unsubscribe(): void {
    super.unsubscribe()
    this.u.unsubscribe()
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
