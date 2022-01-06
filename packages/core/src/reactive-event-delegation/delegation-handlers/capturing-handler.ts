import { EventCapturePropName, RvdEvent, RvdSyntheticEventName } from 'types'
import {
  ReactiveEventDelegationHandler,
  EventTargetManager,
  ReactiveEventDelegationContainer
} from 'shared/types/reactive-event-delegation/event-delegation'
import { applyElementHandler, currentTargetManager } from './utils'
import { fromSyntheticEvent } from '../synthetic-event/from-synthetic-event'

export function initCapturingHandler(
  eventName: RvdSyntheticEventName,
  delegationContainer: ReactiveEventDelegationContainer,
  rootElement: Element
): void {
  const currentTarget = currentTargetManager(rootElement)

  const isClick = eventName === 'click' || eventName === 'dblclick'

  const handler = delegationContainer[eventName] || {}

  handler.captureSub = fromSyntheticEvent(rootElement, eventName, currentTarget.get, isClick, {
    capture: true
  }).subscribe(event =>
    (event.composedPath ? captureWithComposedPath : captureLegacy)(
      event,
      handler,
      `$$${eventName}Capture`,
      currentTarget.set
    )
  )

  delegationContainer[eventName] = handler
}

function captureWithComposedPath(
  event: RvdEvent,
  delegationHandler: ReactiveEventDelegationHandler,
  eventPropName: EventCapturePropName,
  setCurrentTarget: EventTargetManager['set']
): void {
  const composedPath = event.composedPath()
  for (let i = composedPath.length - 1; i >= 0; --i) {
    const currentNode = composedPath[i]

    if (currentNode[eventPropName]) {
      applyElementHandler(
        delegationHandler,
        event,
        eventPropName,
        setCurrentTarget(currentNode as Element)
      )
      if (event.cancelBubble) return
    }
  }
}

function captureLegacy(
  event: RvdEvent,
  delegationHandler: ReactiveEventDelegationHandler,
  eventPropName: EventCapturePropName,
  setCurrentTarget: EventTargetManager['set']
): void {
  let currentNode = event.target as Node
  const capturingQueue: Element[] = []

  do {
    if (currentNode[eventPropName]) {
      capturingQueue.unshift(currentNode as Element)
    }

    currentNode = currentNode.parentNode
  } while (currentNode !== null)

  while (capturingQueue.length > 0) {
    applyElementHandler(
      delegationHandler,
      event,
      eventPropName,
      setCurrentTarget(capturingQueue.shift())
    )
    if (event.cancelBubble) return
  }
}
