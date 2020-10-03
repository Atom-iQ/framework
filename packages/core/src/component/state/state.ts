import { BehaviorSubject } from 'rxjs'
import { first } from 'rxjs/operators'
import { isFunction } from '../../shared'
import type { CreateStateFn, NextStateFn, RxBS, RxO } from '../../shared/types'

const createState: CreateStateFn = <T>(initialState) => {
  const stateSubject: RxBS<T> = new BehaviorSubject(initialState)

  const state$: RxO<T> = stateSubject.asObservable()
  const nextState: NextStateFn<T> = valueOrCallback => {
    if (isFunction(valueOrCallback)) {
      first<T>()(state$).subscribe(state => {
        stateSubject.next(valueOrCallback(state))
      })
    } else {
      stateSubject.next(<T>valueOrCallback)
    }
  }

  return [state$, nextState]
}

export default createState
