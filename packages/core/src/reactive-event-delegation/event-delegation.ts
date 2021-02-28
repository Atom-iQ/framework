import type {
  ReactiveEventDelegationAppContainer
  // ReactiveEventDelegationMultiAppContainer
} from '../shared/types/reactive-event-delegation/event-delegation'
import { RvdAnyEventHandler, RvdDOMEventHandlerName, RvdSyntheticEventName } from 'types'
import { TeardownLogic } from 'rxjs'
import { initBubblingHandler } from './delegation-handlers/bubbling-handler'
import { initCapturingHandler } from './delegation-handlers/capturing-handler'

let eventDelegationAppContainer: ReactiveEventDelegationAppContainer
// const eventDelegationMultiAppContainer: ReactiveEventDelegationMultiAppContainer = {}

export function initEventDelegation(root: Element): void {
  // if (rvDomId) {
  //   eventDelegationMultiAppContainer[rvDomId] = {
  //     root
  //   }
  // } else {
  eventDelegationAppContainer = {
    root
  }
  // }
}

export function handleRedEvent(
  element: Element,
  eventPropName: RvdDOMEventHandlerName,
  handler: RvdAnyEventHandler
): TeardownLogic {
  const eventName = getEventName(eventPropName)
  if (handler.options && handler.options.capture) {
    return handleSyntheticCaptureEvent(element, eventName, handler)
  }
  return handleSyntheticEvent(element, eventName, handler)
}

export function handleSyntheticEvent(
  element: Element,
  eventName: RvdSyntheticEventName,
  eventHandler: RvdAnyEventHandler
  // rvDomId?: string
): TeardownLogic {
  const eventDelegationContainer = eventDelegationAppContainer

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

  const eventFieldName = '$$' + eventName

  return registerEventHandlers(
    element,
    eventName,
    eventFieldName,
    eventHandler,
    eventDelegationContainer
  )
}

export function handleSyntheticCaptureEvent(
  element: Element,
  eventName: RvdSyntheticEventName,
  eventHandler: RvdAnyEventHandler
  // rvDomId?: string
): TeardownLogic {
  const eventDelegationContainer = eventDelegationAppContainer

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

  const eventFieldName = '$$' + eventName + 'Capture'

  return registerCaptureEventHandler(
    element,
    eventName,
    eventFieldName,
    eventHandler,
    eventDelegationContainer
  )
}

// function getDelegationContainer(rvDomId?: string): ReactiveEventDelegationAppContainer {
//   return rvDomId ? eventDelegationMultiAppContainer[rvDomId] : eventDelegationAppContainer
// }
function getEventName(propName: RvdDOMEventHandlerName): RvdSyntheticEventName {
  return propName.substr(2).toLowerCase() as RvdSyntheticEventName
}
/**
 * Adding Synthetic Event handlers for given Element and event name to Atom-iQ
 * Event Delegation connected handlers - they will be called during Synthetic
 * Event bubbling.
 *
 * @param element
 * @param eventName
 * @param eventFieldName
 * @param eventHandler
 * @param eventDelegationContainer
 */
function registerEventHandlers(
  element: Element,
  eventName: RvdSyntheticEventName,
  eventFieldName: string,
  eventHandler: RvdAnyEventHandler,
  eventDelegationContainer: ReactiveEventDelegationAppContainer
): TeardownLogic {
  const delegationHandler = eventDelegationContainer[eventName]
  element[eventFieldName] = eventHandler
  ++delegationHandler.bubbleCount
  /**
   * Teardown function, that will be added to Element subscription,
   * and will be called after Element will be removed from Reactive Virtual DOM.
   * When removed Element was the last connected one, Synthetic Event subscription
   * is unsubscribed and the root Event Delegation handler is deleted.
   */
  return function onElementRemove() {
    if (element[eventFieldName] && --delegationHandler.bubbleCount === 0) {
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
 * @param eventFieldName
 * @param eventHandler
 * @param eventDelegationContainer
 */
function registerCaptureEventHandler(
  element: Element,
  eventName: RvdSyntheticEventName,
  eventFieldName: string,
  eventHandler: RvdAnyEventHandler,
  eventDelegationContainer: ReactiveEventDelegationAppContainer
): TeardownLogic {
  const delegationHandler = eventDelegationContainer[eventName]
  element[eventFieldName] = eventHandler
  ++delegationHandler.captureCount
  /**
   * Teardown function, that will be added to Element subscription,
   * and will be called after Element will be removed from Reactive Virtual DOM.
   * When removed Element was the last connected one, Synthetic Event subscription
   * is unsubscribed and the root Event Delegation handler is deleted.
   */
  return function onElementRemove() {
    if (element[eventFieldName] && --delegationHandler.captureCount === 0) {
      delegationHandler.captureSub.unsubscribe()
      if (!delegationHandler.bubbleCount) {
        delete eventDelegationContainer[eventName]
      }
    }
  }
}
