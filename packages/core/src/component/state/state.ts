import { BehaviorSubject } from 'rxjs'
import { first } from 'rxjs/operators'
import { RxBS, RxO } from '../../shared/types'
import { isFunction } from '../../shared'
import { CreateStateFn, NextStateFn } from '../../shared/types/component/state'

const createState: CreateStateFn = <T>(initialState) => {
  const stateSubject: RxBS<T> = new BehaviorSubject(initialState)

  const state$: RxO<T> = stateSubject.asObservable()
  const nextState: NextStateFn<T> = valueOrCallback => {
    if (isFunction(valueOrCallback)) {
      first()(state$).subscribe(valueOrCallback)
    } else {
      stateSubject.next(<T>valueOrCallback)
    }
  }

  return [state$, nextState]
}

export default createState
