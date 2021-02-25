import { RedEvent, SyntheticEventName } from '../../shared/types'
import {
  EventDelegationQueueItem,
  EventPropertiesManager,
  ReactiveEventDelegationHandler
} from '../../shared/types/reactive-event-delegation/event-delegation'
import { applyElementHandlers, eventPropertiesManager, getTarget } from './utils'
import { filter, switchMap } from 'rxjs/operators'
import { fromSyntheticEvent } from '../synthetic-event/from-synthetic-event'
import { of } from 'rxjs'

export function initCapturingHandler(
  eventName: SyntheticEventName,
  rootElement: Element,
  handler?: ReactiveEventDelegationHandler
): ReactiveEventDelegationHandler {
  const propertiesManager = eventPropertiesManager(rootElement)

  const isClick = eventName === 'click' || eventName === 'dblclick'

  handler = handler || {}

  handler.captureCount = 0
  handler.captureSub = switchMap(
    captureEvents(handler, '$$' + eventName + 'Capture', propertiesManager)
  )(
    fromSyntheticEvent(rootElement, eventName, propertiesManager, isClick, { capture: true })
  ).subscribe()

  return handler
}

function captureEvents(
  delegationHandler: ReactiveEventDelegationHandler,
  eventPropName: string,
  propertiesManager: EventPropertiesManager
) {
  return (event: RedEvent) => {
    let currentNode = getTarget(event)
    const capturingQueue: EventDelegationQueueItem[] = []

    do {
      if (currentNode[eventPropName]) {
        capturingQueue.unshift({
          element: currentNode as Element,
          handlers: currentNode[eventPropName]
        })
      }

      currentNode = currentNode.parentNode
    } while (currentNode !== null)

    if (capturingQueue.length) {
      return dispatchQueuedEvent(
        delegationHandler,
        capturingQueue,
        eventPropName,
        propertiesManager
      )(event)
    }
    return of<null>(null)
  }
}

function dispatchQueuedEvent(
  delegationHandler: ReactiveEventDelegationHandler,
  captureQueuedHandlers: EventDelegationQueueItem[],
  eventPropName: string,
  propertiesManager: EventPropertiesManager
) {
  return (event: RedEvent) => {
    const queueItem = captureQueuedHandlers.shift()

    propertiesManager.setCurrentTarget(queueItem.element)
    const event$ = applyElementHandlers(
      delegationHandler,
      event,
      eventPropName,
      queueItem.element as Element,
      'captureCount',
      queueItem.handlers
    )

    if (captureQueuedHandlers.length === 0) {
      return filter((event: RedEvent) => event && !event.isPropagationStopped())(event$)
    }

    return switchMap(
      dispatchQueuedEvent(
        delegationHandler,
        captureQueuedHandlers,
        eventPropName,
        propertiesManager
      )
    )(filter((event: RedEvent) => event && !event.isPropagationStopped())(event$))
  }
}
