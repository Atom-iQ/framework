import type { BehaviorState } from 'types'
import { BehaviorSubject } from 'rxjs'

/**
 * Create state (BehaviorSubject)
 *
 * Creates internal BehaviorSubject and returns it as Observable in tuple,
 * with nextState function
 * @param initialState
 */
export function createState<T>(initialState: T = null): BehaviorState<T> {
  const stateSubject = new BehaviorSubject<T>(initialState)

  return [stateSubject.asObservable(), stateSubject.next.bind(stateSubject)]
}
