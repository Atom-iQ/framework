import {
  EventTargetManager,
  ReactiveEventDelegationContainer,
  ReactiveEventDelegationHandler
} from 'shared/types/reactive-event-delegation/event-delegation'
import { EventPropName, RvdEvent, RvdSyntheticEventName } from 'types'
import { fromSyntheticEvent } from '../synthetic-event/from-synthetic-event'
import { applyElementHandler, currentTargetManager, isDisabledClick } from './utils'

export function initBubblingHandler(
  eventName: RvdSyntheticEventName,
  delegationContainer: ReactiveEventDelegationContainer,
  rootElement: Element
): void {
  const currentTarget = currentTargetManager(rootElement)

  const isClick = eventName === 'click' || eventName === 'dblclick'

  const handler = delegationContainer[eventName] || {}

  handler.bubbleSub = fromSyntheticEvent(
    rootElement,
    eventName,
    currentTarget.get,
    isClick
  ).subscribe(event =>
    (event.composedPath ? bubbleWithComposedPath : bubbleLegacy)(
      event,
      handler,
      `$$${eventName}`,
      isClick,
      currentTarget.set
    )
  )

  delegationContainer[eventName] = handler
}

function bubbleWithComposedPath(
  event: RvdEvent,
  delegationHandler: ReactiveEventDelegationHandler,
  eventPropName: EventPropName,
  isClick: boolean,
  setCurrentTarget: EventTargetManager['set']
) {
  const composedPath = event.composedPath()
  for (let i = 0, l = composedPath.length; i < l; ++i) {
    const currentNode = composedPath[i]
    if (isDisabledClick(isClick, currentNode as Node)) return

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

function bubbleLegacy(
  event: RvdEvent,
  delegationHandler: ReactiveEventDelegationHandler,
  eventPropName: EventPropName,
  isClick: boolean,
  setCurrentTarget: EventTargetManager['set']
) {
  let currentNode = event.target as Node

  do {
    if (isDisabledClick(isClick, currentNode)) return

    if (currentNode[eventPropName]) {
      applyElementHandler(
        delegationHandler,
        event,
        eventPropName,
        setCurrentTarget(currentNode as Element)
      )
      if (event.cancelBubble) return
    }
    currentNode = currentNode.parentNode
  } while (currentNode !== null)
}
