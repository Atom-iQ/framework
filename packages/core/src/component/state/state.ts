import type { BehaviorState, NextStateCallbackFn } from '../../shared/types'
import { BehaviorSubject, Observable } from 'rxjs'
import { isFunction } from '../../shared'

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
