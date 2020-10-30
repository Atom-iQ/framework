import type { Subscription } from 'rxjs'
import type { ClassicEventHandler, RvdSyntheticEvent, RxEventHandler, SyntheticEventName } from '..'

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
}

export type ConnectedEventHandlers = WeakMap<Element, SyntheticEventHandlers>

export interface SyntheticEventHandlers {
  rx?: RxEventHandler
  fn?: ClassicEventHandler<RvdSyntheticEvent, EventTarget>
}

export interface CurrentTargetManager {
  getCurrentTarget: () => Element
  setCurrentTarget: (currentTarget: Element) => void
}
