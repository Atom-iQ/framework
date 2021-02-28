import type { BehaviorState, NextStateCallbackFn } from 'types'
import { BehaviorSubject, Observable } from 'rxjs'
import { isFunction } from 'shared'

/**
 * Create state (BehaviorSubject)
 *
 * Creates internal BehaviorSubject and returns it as Observable in tuple,
 * with nextState function
 * @param initialState
 */
export function createState<T>(initialState: T = null): BehaviorState<T> {
  const stateSubject = new BehaviorSubject<T>(initialState)

  const state$: Observable<T> = stateSubject.asObservable()

  const nextState = function (valueOrCallback: T | NextStateCallbackFn<T>): void {
    if (isFunction(valueOrCallback)) {
      stateSubject.next(valueOrCallback(stateSubject.getValue()))
    } else {
      stateSubject.next(<T>valueOrCallback)
    }
  }

  return [state$, nextState]
}
