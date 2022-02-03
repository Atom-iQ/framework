import { callBoth } from '@atom-iq/fx'
import { Observable, subject } from '@atom-iq/rx'

import { hookOnInit, hookOverrideOnInit } from './manager'

export interface UseOnInitHook {
  <R extends Observable<void>>(): R
  (onInitCallback: () => void): void
}

export const useOnInit: UseOnInitHook = (onInitCallback?: () => void): void | Observable<void> => {
  const currentOnInit = hookOnInit()
  if (onInitCallback) {
    if (!currentOnInit) hookOverrideOnInit(onInitCallback)
    else hookOverrideOnInit(callBoth(currentOnInit, onInitCallback))
  } else {
    const onInitSubject = subject<void>()
    onInitCallback = () => {
      onInitSubject.next()
      onInitSubject.unsubscribe()
    }
    if (!currentOnInit) hookOverrideOnInit(onInitCallback)
    else hookOverrideOnInit(callBoth(currentOnInit, onInitCallback))
    return onInitSubject
  }
}
