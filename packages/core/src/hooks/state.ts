import {
  asyncInitStateSubject,
  asyncStateSubject,
  ObservableState,
  Scheduler,
  stateSubject,
  unsubscribableSub
} from '@atom-iq/rx';

import { hookComponentNode } from './manager';

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

export const useState: UseState = <T>(
  ...args: [initialState?: T, async?: boolean | AsyncStateOptions]
): ObservableState<T> => {
  let state: ObservableState<T>

  const initialState = args[0]
  const asyncOpts = args[1]

  if (args.length === 0) {
    state = asyncInitStateSubject<T>()
  } else if (args.length === 1 || asyncOpts === false) {
    state = stateSubject<T>(initialState)
  } else if (asyncOpts === true) {
    state = asyncStateSubject(initialState)
  } else {
    state = asyncStateSubject(initialState, asyncOpts.debounce, asyncOpts.scheduler)
  }

  hookComponentNode().sub.add(unsubscribableSub(state))
  return state
}
