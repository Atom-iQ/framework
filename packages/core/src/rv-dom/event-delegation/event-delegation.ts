import {
  ConnectedEventHandlers,
  CurrentTargetManager,
  EventDelegationAppContainer,
  EventDelegationHandler,
  EventDelegationMultiAppContainer,
  SyntheticEventHandlers
} from '../../shared/types/rv-dom/event-delegation'
import { RvdSyntheticEvent, SyntheticEventName } from '../../shared/types'
import { Observable, of, pipe, TeardownLogic } from 'rxjs'
import { initSyntheticEvent } from './init-synthetic-event'

const eventDelegationAppContainer: EventDelegationAppContainer = {}
const eventDelegationMultiAppContainer: EventDelegationMultiAppContainer = {}

export function initEventDelegation(rootDomElement: Element, rvDomId?: string): void {
  if (rvDomId) {
    eventDelegationMultiAppContainer[rvDomId] = {
      rootDomElement
    }
  } else {
    eventDelegationAppContainer.rootDomElement = rootDomElement
  }
}

export function handleSyntheticEvent(
  element: Element,
  eventName: SyntheticEventName,
  eventHandlers: SyntheticEventHandlers,
  rvDomId?: string
): TeardownLogic {
  const eventDelegationContainer = rvDomId
    ? eventDelegationMultiAppContainer[rvDomId]
    : eventDelegationAppContainer

  const hasRegisteredHandler =
    eventDelegationContainer[eventName] &&
    eventDelegationContainer[eventName].connectedHandlers.has(element)

  return hasRegisteredHandler
    ? appendEventHandler(
        eventDelegationContainer[eventName].connectedHandlers,
        element,
        eventHandlers
      )
    : registerEventHandlers(element, eventName, eventHandlers, eventDelegationContainer)
}

function appendEventHandler(
  connectedHandlers: ConnectedEventHandlers,
  element: Element,
  eventHandlers: SyntheticEventHandlers
): void {
  const currentHandlers = connectedHandlers.get(element)
  connectedHandlers.set(element, Object.assign(currentHandlers, eventHandlers))
}

/**
 * Adding Synthetic Event handlers for given Element and event name to Atom-iQ
 * Event Delegation connected handlers - they will be called during Synthetic
 * Event bubbling.
 *
 * When it's a first handler for given event name, it's initializing Synthetic
 * Event Delegation handler on app root Element
 * @param element
 * @param eventName
 * @param eventHandlers
 * @param eventDelegationContainer
 */
function registerEventHandlers(
  element: Element,
  eventName: SyntheticEventName,
  eventHandlers: SyntheticEventHandlers,
  eventDelegationContainer: EventDelegationAppContainer
): TeardownLogic {
  let delegationHandler = eventDelegationContainer[eventName]
  if (!delegationHandler) {
    delegationHandler = eventDelegationContainer[eventName] = initSyntheticEvent(
      eventName,
      eventDelegationContainer.rootDomElement
    )
  }
  delegationHandler.connectedHandlers.set(element, eventHandlers)
  ++delegationHandler.connectedElementsCount
  /**
   * Teardown function, that will be added to Element subscription,
   * and will be called after Element will be removed from Reactive Virtual DOM.
   * When removed Element was the last connected one, Synthetic Event subscription
   * is unsubscribed and the root Event Delegation handler is deleted.
   */
  return function onElementRemove() {
    delegationHandler.connectedHandlers.delete(element)
    if (--delegationHandler.connectedElementsCount === 0) {
      delegationHandler.eventSubscription.unsubscribe()
      delete eventDelegationContainer[eventName]
    }
  }
}
