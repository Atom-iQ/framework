import {
  EventPropertiesManager,
  EventDelegationHandler,
  EventDelegationQueueItem,
  SyntheticEventHandlers
} from '../../shared/types/rv-dom/event-delegation'
import { RvdSyntheticEvent, SyntheticEventName } from '../../shared/types'
import { Observable, of } from 'rxjs'
import { filter, switchMap, tap } from 'rxjs/operators'
import { fromSyntheticEvent } from './from-synthetic-event'
import { isFunction } from '../../shared'

export function initSyntheticEvent(
  eventName: SyntheticEventName,
  rootElement: Element
): EventDelegationHandler {
  const propertiesManager = eventPropertiesManager(rootElement)

  const isClick = eventName === 'click' || eventName === 'dblclick'

  return {
    connectedHandlers: new WeakMap<Element, SyntheticEventHandlers>(),
    connectedCaptureHandlers: new WeakMap<Element, SyntheticEventHandlers>(),
    connectedCaptureHandlersCount: 0,
    connectedElementsCount: 0,
    eventSubscription: switchMap((syntheticEvent: RvdSyntheticEvent) => {
      if (this.connectedCaptureHandlersCount === 0) {
        propertiesManager.setEventPhase(3)
        return bubbleEvents(
          isClick,
          this.connectedHandlers,
          propertiesManager.setCurrentTarget
        )(syntheticEvent)
      }
      return captureAndBubbleEvents(
        isClick,
        this.connectedHandlers,
        this.connectedCaptureHandlers,
        propertiesManager
      )(syntheticEvent)
    })(
      filter<RvdSyntheticEvent>(Boolean)(
        fromSyntheticEvent(rootElement, eventName, propertiesManager, isClick)
      )
    ).subscribe()
  }
}

function eventPropertiesManager(rootTarget: Element): EventPropertiesManager {
  const wrapper = {
    currentTarget: rootTarget,
    eventPhase: 0
  }

  return {
    getCurrentTarget: () => wrapper.currentTarget,
    setCurrentTarget: currentTarget => (wrapper.currentTarget = currentTarget),
    getEventPhase: () => wrapper.eventPhase,
    setEventPhase: eventPhase => (wrapper.eventPhase = eventPhase)
  }
}

function bubbleEvents(
  isClick: boolean,
  connectedHandlers: WeakMap<Element, SyntheticEventHandlers>,
  setTarget: (target: Element) => void,
  parentNode?: Node
) {
  return (event: RvdSyntheticEvent) => {
    let currentNode = parentNode !== undefined ? parentNode : getTarget(event)

    do {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (isClick && (currentNode as any).disabled) {
        return of<null>(null)
      }

      if (connectedHandlers.has(currentNode as Element)) {
        setTarget(currentNode as Element)
        const event$ = applyHandlers(event, connectedHandlers.get(currentNode as Element))

        return switchMap(
          bubbleEvents(isClick, connectedHandlers, setTarget, currentNode.parentNode)
        )(filter((event: RvdSyntheticEvent) => event && !event.isPropagationStopped())(event$))
      }
      currentNode = currentNode.parentNode
    } while (currentNode !== null)
    return of<null>(null)
  }
}

function captureAndBubbleEvents(
  isClick: boolean,
  connectedHandlers: WeakMap<Element, SyntheticEventHandlers>,
  connectedCaptureHandlers: WeakMap<Element, SyntheticEventHandlers>,
  propertiesManager: EventPropertiesManager
) {
  return (event: RvdSyntheticEvent) => {
    let currentNode = getTarget(event)
    let bubblingStopped = false
    const capturingQueue: EventDelegationQueueItem[] = []
    const bubblingQueue: EventDelegationQueueItem[] = []

    do {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (isClick && (currentNode as any).disabled) {
        bubblingStopped = true
      }

      if (connectedHandlers.has(currentNode as Element) && !bubblingStopped) {
        bubblingQueue.push({
          element: currentNode as Element,
          handlers: connectedHandlers.get(currentNode as Element)
        })
      }

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
      return dispatchQueuedEvent(capturingQueue, bubblingQueue, propertiesManager, true)(event)
    }
    propertiesManager.setEventPhase(3)
    return dispatchQueuedEvent([], bubblingQueue, propertiesManager, false)(event)
  }
}

function dispatchQueuedEvent(
  captureHandlers: EventDelegationQueueItem[],
  bubbleHandlers: EventDelegationQueueItem[],
  propertiesManager: EventPropertiesManager,
  isInCapturePhase: boolean
) {
  return (event: RvdSyntheticEvent) => {
    const { element, handlers } = isInCapturePhase
      ? captureHandlers.shift()
      : bubbleHandlers.shift()

    propertiesManager.setCurrentTarget(element)
    let event$ = applyHandlers(event, handlers)

    if (isInCapturePhase && captureHandlers.length === 0) {
      isInCapturePhase = false
      event$ = tap<RvdSyntheticEvent>(() => propertiesManager.setEventPhase(3))(event$)
    }

    if (!isInCapturePhase && bubbleHandlers.length === 0) {
      return filter((event: RvdSyntheticEvent) => event && !event.isPropagationStopped())(event$)
    }

    return switchMap(
      dispatchQueuedEvent(captureHandlers, bubbleHandlers, propertiesManager, isInCapturePhase)
    )(filter((event: RvdSyntheticEvent) => event && !event.isPropagationStopped())(event$))
  }
}

function applyHandlers(
  event: RvdSyntheticEvent,
  handlers: SyntheticEventHandlers
): Observable<RvdSyntheticEvent> {
  if (handlers.rx && handlers.fn) {
    return tap(handlers.fn)(handlers.rx(of<RvdSyntheticEvent>(event)))
  } else if (handlers.rx) {
    return handlers.rx(of<RvdSyntheticEvent>(event))
  } else {
    return tap(handlers.fn)(of<RvdSyntheticEvent>(event))
  }
}

function getTarget(event: RvdSyntheticEvent): Node {
  return (isFunction(event.composedPath) ? event.composedPath()[0] : event.target) as Node
}
