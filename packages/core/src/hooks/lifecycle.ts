import { callBoth } from '@atom-iq/fx'
import { Observable, subject } from '@atom-iq/rx'

import { hookOnInit, hookOverrideOnInit } from './manager'

/**
 * Use On Init hook interface
 */
export interface UseOnInit {
  <R extends Observable<void>>(): R
  (onInitCallback: () => void): void
}

/**
 * Use On Init hook
 *
 * Call provided function after component and its children are initialized.
 * When called without arguments, returns observable that will emit value
 * after initialization
 * @param onInitCallback
 */
export const useOnInit: UseOnInit = (onInitCallback?: () => void | never): void | Observable<void> => {
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
    return onInitSubject as Observable<void>
  }
}
