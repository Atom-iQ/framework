import type { Subscription } from 'rxjs'
import type {
  ClassicEventHandler,
  RvdChangeEvent,
  RvdFormEvent,
  RvdSyntheticEvent,
  RxControlledFormEventHandler,
  RxEventHandler,
  SyntheticEventName
} from '..'

export interface EventDelegationMultiAppContainer {
  [rvDomId: string]: EventDelegationAppContainer
}

export type EventDelegationAppContainer = WithRootDom & EventDelegationHandlers

export type WithRootDom = {
  rootDomElement?: Element
}

export type EventDelegationHandlers = {
  [eventName in SyntheticEventName]?: EventDelegationHandler
}

export interface EventDelegationHandler {
  eventSubscription: Subscription
  connectedHandlers: ConnectedEventHandlers
  connectedElementsCount: number
  connectedCaptureHandlers: ConnectedEventHandlers
  connectedCaptureHandlersCount: number
}

export type ConnectedEventHandlers = WeakMap<Element, SyntheticEventHandlers>

export interface SyntheticEventHandlers {
  rx?: RxEventHandler<RvdSyntheticEvent>
  fn?: ClassicEventHandler<RvdSyntheticEvent>
  form?: RxControlledFormEventHandler<RvdFormEvent<Element> | RvdChangeEvent<Element>>
}

export interface EventPropertiesManager {
  getCurrentTarget: () => Element
  setCurrentTarget: (currentTarget: Element) => void
  getEventPhase: () => number
  setEventPhase: (eventPhase: number) => void
}

export interface EventDelegationQueueItem {
  element: Element
  handlers: SyntheticEventHandlers
}
