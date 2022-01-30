import { stateSubject } from '@atom-iq/rx'
import type { ObservableState } from 'types'

/**
 * Create state (BehaviorSubject)
 *
 * Creates internal BehaviorSubject and returns it as Observable in tuple,
 * with nextState function
 * @param initialState
 */
export function createState<T>(initialState: T = null): ObservableState<T> {
  const state = stateSubject<T>(initialState)

  return [state, state.next.bind(state), state.getValue.bind(state)]
}
