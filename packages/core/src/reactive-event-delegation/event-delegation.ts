import type {
  ConnectedEventHandlers,
  ReactiveEventDelegationAppContainer,
  ReactiveEventDelegationMultiAppContainer,
  SyntheticEventHandlers
} from '../shared/types/rv-dom/event-delegation'
import { SyntheticEventName } from '../shared/types'
import { TeardownLogic } from 'rxjs'
import { initBubblingHandler } from './delegation-handlers/bubbling-handler'
import { initCapturingHandler } from './delegation-handlers/capturing-handler'

let eventDelegationAppContainer: ReactiveEventDelegationAppContainer
const eventDelegationMultiAppContainer: ReactiveEventDelegationMultiAppContainer = {}

export function initEventDelegation(rootDomElement: Element, rvDomId?: string): void {
  if (rvDomId) {
    eventDelegationMultiAppContainer[rvDomId] = {
      rootDomElement
    }
  } else {
    eventDelegationAppContainer = {
      rootDomElement
    }
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
    eventDelegationContainer[eventName] = initBubblingHandler(
      eventName,
      eventDelegationContainer.rootDomElement
    )
  } else if (!eventDelegationContainer[eventName].connectedHandlersCount) {
    eventDelegationContainer[eventName] = initBubblingHandler(
      eventName,
      eventDelegationContainer.rootDomElement,
      eventDelegationContainer[eventName]
    )
  }

  return hasRegisteredHandlers(
    element,
    eventDelegationContainer[eventName].connectedHandlers,
    eventDelegationContainer[eventName].connectedHandlersCount
  )
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

  if (!eventDelegationContainer[eventName]) {
    eventDelegationContainer[eventName] = initCapturingHandler(
      eventName,
      eventDelegationContainer.rootDomElement
    )
  } else if (!eventDelegationContainer[eventName].connectedCaptureHandlersCount) {
    eventDelegationContainer[eventName] = initCapturingHandler(
      eventName,
      eventDelegationContainer.rootDomElement,
      eventDelegationContainer[eventName]
    )
  }

  return hasRegisteredHandlers(
    element,
    eventDelegationContainer[eventName].connectedCaptureHandlers,
    eventDelegationContainer[eventName].connectedCaptureHandlersCount
  )
    ? appendEventHandlers(
        eventDelegationContainer[eventName].connectedCaptureHandlers,
        element,
        eventHandlers
      )
    : registerCaptureEventHandlers(element, eventName, eventHandlers, eventDelegationContainer)
}

function getDelegationContainer(rvDomId?: string): ReactiveEventDelegationAppContainer {
  return rvDomId ? eventDelegationMultiAppContainer[rvDomId] : eventDelegationAppContainer
}

function hasRegisteredHandlers(
  element: Element,
  connectedHandlers: ConnectedEventHandlers,
  connectedHandlersCount: number
): boolean {
  return connectedHandlersCount > 0 && connectedHandlers.has(element)
}

function appendEventHandlers(
  connectedHandlers: ConnectedEventHandlers,
  element: Element,
  eventHandlers: SyntheticEventHandlers
): void {
  connectedHandlers.set(element, Object.assign(connectedHandlers.get(element), eventHandlers))
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
  eventDelegationContainer: ReactiveEventDelegationAppContainer
): TeardownLogic {
  const delegationHandler = eventDelegationContainer[eventName]
  delegationHandler.connectedHandlers.set(element, eventHandlers)
  ++delegationHandler.connectedHandlersCount
  /**
   * Teardown function, that will be added to Element subscription,
   * and will be called after Element will be removed from Reactive Virtual DOM.
   * When removed Element was the last connected one, Synthetic Event subscription
   * is unsubscribed and the root Event Delegation handler is deleted.
   */
  return function onElementRemove() {
    delegationHandler.connectedHandlers.delete(element)
    if (--delegationHandler.connectedHandlersCount === 0) {
      delegationHandler.bubblingSubscription.unsubscribe()
      if (!delegationHandler.connectedCaptureHandlersCount) {
        delete eventDelegationContainer[eventName]
      }
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
  eventDelegationContainer: ReactiveEventDelegationAppContainer
): TeardownLogic {
  const delegationHandler = eventDelegationContainer[eventName]
  delegationHandler.connectedCaptureHandlers.set(element, eventHandlers)
  ++delegationHandler.connectedCaptureHandlersCount
  /**
   * Teardown function, that will be added to Element subscription,
   * and will be called after Element will be removed from Reactive Virtual DOM.
   * When removed Element was the last connected one, Synthetic Event subscription
   * is unsubscribed and the root Event Delegation handler is deleted.
   */
  return function onElementRemove() {
    delegationHandler.connectedCaptureHandlers.delete(element)
    if (--delegationHandler.connectedCaptureHandlersCount === 0) {
      delegationHandler.capturingSubscription.unsubscribe()
      if (!delegationHandler.connectedHandlersCount) {
        delete eventDelegationContainer[eventName]
      }
    }
  }
}
