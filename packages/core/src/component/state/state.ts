import type { CreateStateFn, NextStateFn } from '../../shared/types'
import { BehaviorSubject, Observable } from 'rxjs'
import { isFunction } from '../../shared'

export const createState: CreateStateFn = <T>(initialState) => {
  const stateSubject = new BehaviorSubject<T>(initialState)

  const state$: Observable<T> = stateSubject.asObservable()
  const nextState: NextStateFn<T> = valueOrCallback => {
    if (isFunction(valueOrCallback)) {
      stateSubject.next(valueOrCallback(stateSubject.getValue()))
    } else {
      stateSubject.next(<T>valueOrCallback)
    }
  }

  return [state$, nextState]
}
