import type {
  RvdAnyEventHandler,
  RvdContext,
  RvdDOMEventHandlerName,
  RvdSyntheticEventName,
  RvdElementNode
} from 'types'
import { initBubblingHandler } from './delegation-handlers/bubbling-handler'
import { initCapturingHandler } from './delegation-handlers/capturing-handler'
import { atomiqContext } from 'shared'

export function handleRedEvent(
  eventPropName: RvdDOMEventHandlerName,
  rvdElement: RvdElementNode,
  context: RvdContext
): void {
  const eventName = getEventName(eventPropName)
  const handler = rvdElement.props[eventPropName]
  if (handler.options && handler.options.capture) {
    return handleSyntheticCaptureEvent(rvdElement.dom, eventName, handler, context)
  }
  return handleSyntheticEvent(rvdElement.dom, eventName, handler, context)
}

export function handleSyntheticEvent(
  element: Element,
  eventName: RvdSyntheticEventName,
  eventHandler: RvdAnyEventHandler,
  context: RvdContext
): void {
  const container = atomiqContext(context).delegationContainer
  if (!container[eventName] || !container[eventName].bubbleSub) {
    initBubblingHandler(eventName, container, atomiqContext(context).rootElement)
  }

  element['$$' + eventName] = eventHandler
}

export function handleSyntheticCaptureEvent(
  element: Element,
  eventName: RvdSyntheticEventName,
  eventHandler: RvdAnyEventHandler,
  context: RvdContext
): void {
  const container = atomiqContext(context).delegationContainer
  if (!container[eventName] || !container[eventName].captureSub) {
    initCapturingHandler(eventName, container, atomiqContext(context).rootElement)
  }

  element['$$' + eventName + 'Capture'] = eventHandler
}

// function getDelegationContainer(rvDomId?: string): ReactiveEventDelegationAppContainer {
//   return rvDomId ? eventDelegationMultiAppContainer[rvDomId] : eventDelegationAppContainer
// }
function getEventName(propName: RvdDOMEventHandlerName): RvdSyntheticEventName {
  return propName.substr(2).toLowerCase() as RvdSyntheticEventName
}
