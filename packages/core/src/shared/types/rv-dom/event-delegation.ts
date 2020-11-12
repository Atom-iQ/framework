import type { Subscription } from 'rxjs'
import type {
  ClassicEventHandler,
  RedChangeEvent,
  RedFormEvent,
  RedEvent,
  ReactiveControlledFormEventHandler,
  ReactiveEventHandler,
  SyntheticEventName
} from '..'

export interface ReactiveEventDelegationMultiAppContainer {
  [rvDomId: string]: ReactiveEventDelegationAppContainer
}

export type ReactiveEventDelegationAppContainer = WithRootDom & ReactiveEventDelegationHandlers

export type WithRootDom = {
  root?: Element
}

export type ReactiveEventDelegationHandlers = {
  [eventName in SyntheticEventName]?: ReactiveEventDelegationHandler
}

export interface ReactiveEventDelegationHandler {
  bubbleSub?: Subscription
  captureSub?: Subscription
  bubbleCount?: number
  captureCount?: number
}

export type ConnectedEventHandlers = WeakMap<Element, SyntheticEventHandlers>

export interface SyntheticEventHandlers {
  rx?: ReactiveEventHandler<RedEvent>
  fn?: ClassicEventHandler<RedEvent>
  form?: ReactiveControlledFormEventHandler<RedFormEvent | RedChangeEvent>
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
  handlers: SyntheticEventHandlers
}
