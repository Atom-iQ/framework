import type { Observer, ObservableState, Subscription, Unsubscribable } from '../../types'
import { Subject } from '../subject'
import { EMPTY_SUB, subjectSub } from '../../subscription'
import { unsubscribedError } from '../utils'

/**
 * State Subject Factory
 *
 * Create new state subject. This type of subject always emits its current
 * state value to newly subscribed observers. It has initial value. Every
 * next value is delivered synchronously.
 */
export const stateSubject = <T>(initialValue: T): StateSubject<T> =>
  new StateSubject<T>(initialValue)

/**
 * State Subject
 *
 * State subject keeps state internally (with initial value),
 * and always emits its current value to newly subscribed observers
 * Every next value is delivered synchronously
 */
export class StateSubject<T> extends Subject<T> implements ObservableState<T>, Unsubscribable {
  /**
   * s - state
   *
   * Current state value, initialized with value in constructor
   */
  private s: T

  constructor(initialState: T) {
    super()
    // Set initial state value
    this.s = initialState
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
   * Emit next value to observers connected to subject and save new value
   * as current state
   * @param value
   */
  next(value: T): void {
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
