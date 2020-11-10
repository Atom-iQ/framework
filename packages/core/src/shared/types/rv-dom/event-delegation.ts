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
  rootDomElement?: Element
}

export type ReactiveEventDelegationHandlers = {
  [eventName in SyntheticEventName]?: ReactiveEventDelegationHandler
}

export interface ReactiveEventDelegationHandler {
  bubblingSubscription?: Subscription
  capturingSubscription?: Subscription
  connectedHandlers?: ConnectedEventHandlers
  connectedHandlersCount?: number
  connectedCaptureHandlers?: ConnectedEventHandlers
  connectedCaptureHandlersCount?: number
}

export type ConnectedEventHandlers = WeakMap<Element, SyntheticEventHandlers>

export interface SyntheticEventHandlers {
  rx?: ReactiveEventHandler<RedEvent>
  fn?: ClassicEventHandler<RedEvent>
  form?: ReactiveControlledFormEventHandler<RedFormEvent | RedChangeEvent>
}

export interface SyntheticEventPropertiesWrapper {
  currentTarget: EventTarget
  eventPhase: number
}

export interface EventPropertiesManager {
  getCurrentTarget: () => EventTarget
  setCurrentTarget: (currentTarget: EventTarget) => void
  getEventPhase: () => number
  setEventPhase: (eventPhase: number) => void
}

export interface EventDelegationQueueItem {
  element: EventTarget
  handlers: SyntheticEventHandlers
}
