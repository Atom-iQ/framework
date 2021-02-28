import { RvdEvent, RvdSyntheticEventName } from 'types'
import {
  EventDelegationQueueItem,
  EventPropertiesManager,
  ReactiveEventDelegationHandler
} from '../../shared/types/reactive-event-delegation/event-delegation'
import { applyElementHandler, eventPropertiesManager, getTarget } from './utils'
import { fromSyntheticEvent } from '../synthetic-event/from-synthetic-event'

export function initCapturingHandler(
  eventName: RvdSyntheticEventName,
  rootElement: Element,
  handler?: ReactiveEventDelegationHandler
): ReactiveEventDelegationHandler {
  const propertiesManager = eventPropertiesManager(rootElement)

  const isClick = eventName === 'click' || eventName === 'dblclick'

  handler = handler || {}

  handler.captureCount = 0
  handler.captureSub = fromSyntheticEvent(rootElement, eventName, propertiesManager, isClick, {
    capture: true
  }).subscribe(captureEvents(handler, '$$' + eventName + 'Capture', propertiesManager))

  return handler
}

function captureEvents(
  delegationHandler: ReactiveEventDelegationHandler,
  eventPropName: string,
  propertiesManager: EventPropertiesManager
) {
  return (event: RvdEvent): void => {
    let currentNode = getTarget(event)
    const capturingQueue: EventDelegationQueueItem[] = []

    do {
      if (currentNode[eventPropName]) {
        capturingQueue.unshift({
          element: currentNode as Element,
          handler: currentNode[eventPropName]
        })
      }

      currentNode = currentNode.parentNode
    } while (currentNode !== null)

    if (capturingQueue.length) {
      dispatchQueuedEvent(
        event,
        delegationHandler,
        capturingQueue,
        eventPropName,
        propertiesManager
      )
    }
  }
}

function dispatchQueuedEvent(
  event: RvdEvent,
  delegationHandler: ReactiveEventDelegationHandler,
  captureQueuedHandlers: EventDelegationQueueItem[],
  eventPropName: string,
  propertiesManager: EventPropertiesManager
): void {
  do {
    const queueItem = captureQueuedHandlers.shift()

    propertiesManager.setCurrentTarget(queueItem.element)
    applyElementHandler(
      delegationHandler,
      event,
      eventPropName,
      queueItem.element as Element,
      'captureCount',
      queueItem.handler
    )
    if (event.cancelBubble) return
  } while (captureQueuedHandlers.length > 0)
}
