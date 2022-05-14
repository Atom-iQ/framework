import {
  asyncInitStateSubject,
  asyncStateSubject,
  ObservableState,
  Scheduler,
  stateSubject,
  unsubscribableSub
} from '@atom-iq/rx';

import { hookComponentNode } from './manager';

interface UseState {
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
  const { sub } = hookComponentNode()

  let state: ObservableState<T>

  if (args.length === 0) {
    state = asyncInitStateSubject<T>()
  } else if (args.length === 1 || args[1] === false) {
    state = stateSubject<T>(args[0])
  } else if (args[1] === true) {
    state = asyncStateSubject(args[0])
  } else {
    state = asyncStateSubject(args[0], args[1].debounce, args[1].scheduler)
  }

  sub.add(unsubscribableSub(state))
  return state
}
