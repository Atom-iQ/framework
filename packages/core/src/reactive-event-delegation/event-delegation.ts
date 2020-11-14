import type {
  ReactiveEventDelegationAppContainer,
  ReactiveEventDelegationMultiAppContainer,
  SyntheticEventHandlers
} from '../shared/types/reactive-event-delegation/event-delegation'
import { SyntheticEventName } from '../shared/types'
import { TeardownLogic } from 'rxjs'
import { initBubblingHandler } from './delegation-handlers/bubbling-handler'
import { initCapturingHandler } from './delegation-handlers/capturing-handler'

let eventDelegationAppContainer: ReactiveEventDelegationAppContainer
const eventDelegationMultiAppContainer: ReactiveEventDelegationMultiAppContainer = {}

export function initEventDelegation(root: Element, rvDomId?: string): void {
  if (rvDomId) {
    eventDelegationMultiAppContainer[rvDomId] = {
      root
    }
  } else {
    eventDelegationAppContainer = {
      root
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
      eventDelegationContainer.root
    )
  } else if (!eventDelegationContainer[eventName].bubbleCount) {
    eventDelegationContainer[eventName] = initBubblingHandler(
      eventName,
      eventDelegationContainer.root,
      eventDelegationContainer[eventName]
    )
  }

  const eventPropName = '$$' + eventName

  return eventDelegationContainer[eventName].bubbleCount && element[eventPropName]
    ? appendEventHandlers(eventPropName, element, eventHandlers)
    : registerEventHandlers(
        element,
        eventName,
        eventPropName,
        eventHandlers,
        eventDelegationContainer
      )
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
      eventDelegationContainer.root
    )
  } else if (!eventDelegationContainer[eventName].captureCount) {
    eventDelegationContainer[eventName] = initCapturingHandler(
      eventName,
      eventDelegationContainer.root,
      eventDelegationContainer[eventName]
    )
  }

  const eventPropName = '$$' + eventName + 'Capture'

  return eventDelegationContainer[eventName].bubbleCount && element[eventPropName]
    ? appendEventHandlers(eventPropName, element, eventHandlers)
    : registerCaptureEventHandlers(
        element,
        eventName,
        eventPropName,
        eventHandlers,
        eventDelegationContainer
      )
}

function getDelegationContainer(rvDomId?: string): ReactiveEventDelegationAppContainer {
  return rvDomId ? eventDelegationMultiAppContainer[rvDomId] : eventDelegationAppContainer
}

function appendEventHandlers(
  eventPropName: string,
  element: Element,
  eventHandlers: SyntheticEventHandlers
): void {
  element[eventPropName] = Object.assign(element[eventPropName], eventHandlers)
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
  eventPropName: string,
  eventHandlers: SyntheticEventHandlers,
  eventDelegationContainer: ReactiveEventDelegationAppContainer
): TeardownLogic {
  const delegationHandler = eventDelegationContainer[eventName]
  element[eventPropName] = eventHandlers
  ++delegationHandler.bubbleCount
  /**
   * Teardown function, that will be added to Element subscription,
   * and will be called after Element will be removed from Reactive Virtual DOM.
   * When removed Element was the last connected one, Synthetic Event subscription
   * is unsubscribed and the root Event Delegation handler is deleted.
   */
  return function onElementRemove() {
    if (element[eventPropName] && --delegationHandler.bubbleCount === 0) {
      delegationHandler.bubbleSub.unsubscribe()
      if (!delegationHandler.captureCount) {
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
  eventPropName: string,
  eventHandlers: SyntheticEventHandlers,
  eventDelegationContainer: ReactiveEventDelegationAppContainer
): TeardownLogic {
  const delegationHandler = eventDelegationContainer[eventName]
  element[eventPropName] = eventHandlers
  ++delegationHandler.captureCount
  /**
   * Teardown function, that will be added to Element subscription,
   * and will be called after Element will be removed from Reactive Virtual DOM.
   * When removed Element was the last connected one, Synthetic Event subscription
   * is unsubscribed and the root Event Delegation handler is deleted.
   */
  return function onElementRemove() {
    if (element[eventPropName] && --delegationHandler.captureCount === 0) {
      delegationHandler.captureSub.unsubscribe()
      if (!delegationHandler.bubbleCount) {
        delete eventDelegationContainer[eventName]
      }
    }
  }
}
