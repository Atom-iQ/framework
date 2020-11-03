import {
  ConnectedEventHandlers,
  EventDelegationAppContainer,
  EventDelegationHandler,
  EventDelegationMultiAppContainer,
  SyntheticEventHandlers
} from '../../shared/types/rv-dom/event-delegation'
import { SyntheticEventName } from '../../shared/types'
import { TeardownLogic } from 'rxjs'
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
  const eventDelegationContainer = getDelegationContainer(rvDomId)

  if (!eventDelegationContainer[eventName]) {
    eventDelegationContainer[eventName] = initSyntheticEvent(
      eventName,
      eventDelegationContainer.rootDomElement
    )
  }

  return hasRegisteredHandlers(element, eventDelegationContainer[eventName])
    ? appendEventHandlers(
        eventDelegationContainer[eventName].connectedHandlers,
        element,
        eventHandlers
      )
    : registerEventHandlers(element, eventName, eventHandlers, eventDelegationContainer)
}

export function handleSyntheticCaptureEvent(
  element: Element,
  eventName: SyntheticEventName,
  eventHandlers: SyntheticEventHandlers,
  rvDomId?: string
): TeardownLogic {
  const eventDelegationContainer = getDelegationContainer(rvDomId)

  // TODO: Separate listeners for Capture phase

  if (!eventDelegationContainer[eventName]) {
    eventDelegationContainer[eventName] = initSyntheticEvent(
      eventName,
      eventDelegationContainer.rootDomElement
    )
  }

  return hasRegisteredHandlers(element, eventDelegationContainer[eventName])
    ? appendCaptureEventHandlers(eventDelegationContainer[eventName], element, eventHandlers)
    : registerCaptureEventHandlers(element, eventName, eventHandlers, eventDelegationContainer)
}

function getDelegationContainer(rvDomId?: string): EventDelegationAppContainer {
  return rvDomId ? eventDelegationMultiAppContainer[rvDomId] : eventDelegationAppContainer
}

function hasRegisteredHandlers(
  element: Element,
  delegationHandler: EventDelegationHandler
): boolean {
  return (
    delegationHandler &&
    (delegationHandler.connectedHandlers.has(element) ||
      (delegationHandler.connectedCaptureHandlersCount > 0 &&
        delegationHandler.connectedCaptureHandlers.has(element)))
  )
}

function appendEventHandlers(
  connectedHandlers: ConnectedEventHandlers,
  element: Element,
  eventHandlers: SyntheticEventHandlers
): void {
  const newHandlers = connectedHandlers.has(element)
    ? Object.assign(connectedHandlers.get(element), eventHandlers)
    : eventHandlers
  connectedHandlers.set(element, newHandlers)
}

function appendCaptureEventHandlers(
  delegationHandler: EventDelegationHandler,
  element: Element,
  eventHandlers: SyntheticEventHandlers
): void {
  const connectedHandlers = delegationHandler.connectedCaptureHandlers
  if (connectedHandlers.has(element)) {
    connectedHandlers.set(element, Object.assign(connectedHandlers.get(element), eventHandlers))
  } else {
    connectedHandlers.set(element, eventHandlers)
    ++delegationHandler.connectedCaptureHandlersCount
  }
}

/**
 * Adding Synthetic Event handlers for given Element and event name to Atom-iQ
 * Event Delegation connected handlers - they will be called during Synthetic
 * Event bubbling.
 *
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
  const delegationHandler = eventDelegationContainer[eventName]
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
    if (
      delegationHandler.connectedCaptureHandlersCount &&
      delegationHandler.connectedCaptureHandlers.has(element)
    ) {
      delegationHandler.connectedCaptureHandlers.delete(element)
      --delegationHandler.connectedCaptureHandlersCount
    }
    if (--delegationHandler.connectedElementsCount === 0) {
      delegationHandler.eventSubscription.unsubscribe()
      delete eventDelegationContainer[eventName]
    }
  }
}

/**
 * Adding Synthetic Capture Event handlers for given Element and event name to Atom-iQ
 * Event Delegation connected capture handlers - they will be called during Synthetic
 * Event capture phase.
 *
 * @param element
 * @param eventName
 * @param eventHandlers
 * @param eventDelegationContainer
 */
function registerCaptureEventHandlers(
  element: Element,
  eventName: SyntheticEventName,
  eventHandlers: SyntheticEventHandlers,
  eventDelegationContainer: EventDelegationAppContainer
): TeardownLogic {
  const delegationHandler = eventDelegationContainer[eventName]
  delegationHandler.connectedCaptureHandlers.set(element, eventHandlers)
  ++delegationHandler.connectedElementsCount
  ++delegationHandler.connectedCaptureHandlersCount
  /**
   * Teardown function, that will be added to Element subscription,
   * and will be called after Element will be removed from Reactive Virtual DOM.
   * When removed Element was the last connected one, Synthetic Event subscription
   * is unsubscribed and the root Event Delegation handler is deleted.
   */
  return function onElementRemove() {
    delegationHandler.connectedCaptureHandlers.delete(element)
    --delegationHandler.connectedCaptureHandlersCount
    if (delegationHandler.connectedHandlers.has(element)) {
      delegationHandler.connectedHandlers.delete(element)
    }
    if (--delegationHandler.connectedElementsCount === 0) {
      delegationHandler.eventSubscription.unsubscribe()
      delete eventDelegationContainer[eventName]
    }
  }
}
