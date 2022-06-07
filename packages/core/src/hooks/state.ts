import {
  asyncInitStateSubject,
  asyncStateSubject,
  ObservableState,
  Scheduler,
  stateSubject,
  unsubscribableSub
} from '@atom-iq/rx';

import { hookComponentNode } from './manager';

/**
 * Use State hook interface
 */
export interface UseState {
  <T>(): ObservableState<T>
  <T>(initialState: T): ObservableState<T>
  <T>(initialState: T, async: boolean): ObservableState<T>
  <T>(initialState: T, async: AsyncStateOptions): ObservableState<T>
}

interface AsyncStateOptions {
  debounce?: boolean
  scheduler?: Scheduler
}

/**
 * Use State hook
 *
 * Create and return state subject, depending on arguments:
 * - no args - async init state subject (async init, sync updates)
 * - 1 arg (or 2 args with false as second arg) - state subject (sync init and updates)
 * - 2 args - async state subject (sync init, async updates)
 * @param args
 */
export const useState: UseState = <T>(
  ...args: [initialState?: T, async?: boolean | AsyncStateOptions]
): ObservableState<T> => {
  let state: ObservableState<T>

  const [initialState, asyncOptions] = args

  if (args.length === 0) {
    state = asyncInitStateSubject<T>()
  } else if (args.length === 1 || asyncOptions === false) {
    state = stateSubject<T>(initialState)
  } else if (asyncOptions === true) {
    state = asyncStateSubject(initialState)
  } else {
    state = asyncStateSubject(initialState, asyncOptions.debounce, asyncOptions.scheduler)
  }

  hookComponentNode().sub.add(unsubscribableSub(state))
  return state
}
