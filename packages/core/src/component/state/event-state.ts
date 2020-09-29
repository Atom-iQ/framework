import {BehaviorSubject} from 'rxjs'
import {first} from 'rxjs/operators'
import { RxBS, RxO } from '../../shared/types'
import { isFunction } from '../../shared'

const createState = function<T extends unknown = unknown>(
  initialState: T
): [RxO<T>, (valueOrCallback: T | ((lastValue: T) => T)) => void] {
  const stateSubject: RxBS<T> =
    new BehaviorSubject(initialState)

  const state$: RxO<T> = stateSubject.asObservable()
  const nextState = valueOrCallback  => {
    if (isFunction(valueOrCallback)) {
      state$.pipe(
        first()
      ).subscribe(valueOrCallback)
    } else {
      stateSubject.next(<T>valueOrCallback)
    }
  }

  return [state$, nextState]
}

export default createState
