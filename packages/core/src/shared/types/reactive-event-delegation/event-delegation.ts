import type { Subscription } from 'rxjs'
import type { RvdSyntheticEventName, RvdAnyEventHandler } from './events'

export interface ReactiveEventDelegationMultiAppContainer {
  [rvDomId: string]: ReactiveEventDelegationAppContainer
}

export type ReactiveEventDelegationAppContainer = WithRootDom & ReactiveEventDelegationHandlers

export interface WithRootDom {
  root?: Element
}

export type ReactiveEventDelegationHandlers = {
  [eventName in RvdSyntheticEventName]?: ReactiveEventDelegationHandler
}

export interface ReactiveEventDelegationHandler {
  bubbleSub?: Subscription
  captureSub?: Subscription
  bubbleCount?: number
  captureCount?: number
}

export interface SyntheticEventPropertiesWrapper {
  currentTarget: EventTarget
}

export interface EventPropertiesManager {
  getCurrentTarget: () => EventTarget
  setCurrentTarget: (currentTarget: EventTarget) => void
}

export interface EventDelegationQueueItem {
  element: EventTarget
  handler: RvdAnyEventHandler
}
