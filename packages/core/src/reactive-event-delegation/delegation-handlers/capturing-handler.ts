import { RedEvent, SyntheticEventName } from '../../shared/types'
import {
  EventDelegationQueueItem,
  EventPropertiesManager,
  ReactiveEventDelegationHandler,
  SyntheticEventHandlers
} from '../../shared/types/rv-dom/event-delegation'
import { applyElementHandlers, eventPropertiesManager, getTarget } from './utils'
import { filter, switchMap } from 'rxjs/operators'
import { fromSyntheticEvent } from '../synthetic-event/from-synthetic-event'
import { of } from 'rxjs'

export function initCapturingHandler(
  eventName: SyntheticEventName,
  rootElement: Element,
  currentHandler?: ReactiveEventDelegationHandler
): ReactiveEventDelegationHandler {
  const propertiesManager = eventPropertiesManager(rootElement)

  const isClick = eventName === 'click' || eventName === 'dblclick'

  if (currentHandler) {
    currentHandler.connectedCaptureHandlers = new WeakMap<Element, SyntheticEventHandlers>()
    currentHandler.connectedCaptureHandlersCount = 0
    currentHandler.capturingSubscription = switchMap(
      captureEvents(currentHandler.connectedCaptureHandlers, propertiesManager)
    )(
      filter<RedEvent>(Boolean)(
        fromSyntheticEvent(rootElement, eventName, propertiesManager, isClick, { capture: true })
      )
    ).subscribe()

    return currentHandler
  } else {
    const connectedCaptureHandlers = new WeakMap<Element, SyntheticEventHandlers>()

    return {
      connectedCaptureHandlers,
      connectedCaptureHandlersCount: 0,
      capturingSubscription: switchMap(captureEvents(connectedCaptureHandlers, propertiesManager))(
        filter<RedEvent>(Boolean)(
          fromSyntheticEvent(rootElement, eventName, propertiesManager, isClick, { capture: true })
        )
      ).subscribe()
    }
  }
}

function captureEvents(
  connectedCaptureHandlers: WeakMap<Element, SyntheticEventHandlers>,
  propertiesManager: EventPropertiesManager
) {
  return (event: RedEvent) => {
    let currentNode = getTarget(event)
    const capturingQueue: EventDelegationQueueItem[] = []

    do {
      if (connectedCaptureHandlers.has(currentNode as Element)) {
        capturingQueue.unshift({
          element: currentNode as Element,
          handlers: connectedCaptureHandlers.get(currentNode as Element)
        })
      }

      currentNode = currentNode.parentNode
    } while (currentNode !== null)

    if (capturingQueue.length) {
      propertiesManager.setEventPhase(1)
      return dispatchQueuedEvent(capturingQueue, propertiesManager, connectedCaptureHandlers)(event)
    }
    return of<null>(null)
  }
}

function dispatchQueuedEvent(
  captureQueuedHandlers: EventDelegationQueueItem[],
  propertiesManager: EventPropertiesManager,
  connectedCaptureHandlers: WeakMap<Element, SyntheticEventHandlers>
) {
  return (event: RedEvent) => {
    const queueItem = captureQueuedHandlers.shift()

    propertiesManager.setCurrentTarget(queueItem.element)
    const event$ = applyElementHandlers(
      event,
      queueItem.element as Element,
      connectedCaptureHandlers,
      queueItem.handlers
    )

    if (captureQueuedHandlers.length === 0) {
      return filter((event: RedEvent) => event && !event.isPropagationStopped())(event$)
    }

    return switchMap(
      dispatchQueuedEvent(captureQueuedHandlers, propertiesManager, connectedCaptureHandlers)
    )(filter((event: RedEvent) => event && !event.isPropagationStopped())(event$))
  }
}
