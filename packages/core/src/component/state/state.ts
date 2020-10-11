import type { CreateStateFn, NextStateFn, RxBS, RxO } from '../../shared/types'
import { BehaviorSubject } from 'rxjs'
import { isFunction } from '../../shared'

export const createState: CreateStateFn = <T>(initialState) => {
  const stateSubject: RxBS<T> = new BehaviorSubject(initialState)

  const state$: RxO<T> = stateSubject.asObservable()
  const nextState: NextStateFn<T> = valueOrCallback => {
    if (isFunction(valueOrCallback)) {
      stateSubject.next(valueOrCallback(stateSubject.getValue()))
    } else {
      stateSubject.next(<T>valueOrCallback)
    }
  }

  return [state$, nextState]
}
