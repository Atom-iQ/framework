import type { Subscription } from 'rxjs'
import type { RvdSyntheticEventName } from 'types'

export type ReactiveEventDelegationContainer = {
  [eventName in RvdSyntheticEventName]?: ReactiveEventDelegationHandler
}

export interface ReactiveEventDelegationHandler {
  bubbleSub?: Subscription
  captureSub?: Subscription
}

export interface EventTargetManager<Target extends EventTarget = Element> {
  get: () => Target
  set: (target: Target) => Target
}
