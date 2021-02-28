import { ReactiveEventDelegationHandler } from '../../shared/types/reactive-event-delegation/event-delegation'
import { RvdEvent, RvdSyntheticEventName } from '../../shared/types'
import { fromSyntheticEvent } from '../synthetic-event/from-synthetic-event'
import { applyElementHandler, eventPropertiesManager, getTarget } from './utils'

export function initBubblingHandler(
  eventName: RvdSyntheticEventName,
  rootElement: Element,
  handler?: ReactiveEventDelegationHandler
): ReactiveEventDelegationHandler {
  const propertiesManager = eventPropertiesManager(rootElement)

  const isClick = eventName === 'click' || eventName === 'dblclick'

  handler = handler || {}

  handler.bubbleCount = 0
  handler.bubbleSub = fromSyntheticEvent(
    rootElement,
    eventName,
    propertiesManager,
    isClick
  ).subscribe(bubbleEvents(handler, '$$' + eventName, isClick, propertiesManager.setCurrentTarget))

  return handler
}

function bubbleEvents(
  delegationHandler: ReactiveEventDelegationHandler,
  eventPropName: string,
  isClick: boolean,
  setTarget: (target: Element) => void
) {
  return function bubble(event: RvdEvent) {
    let currentNode = getTarget(event)

    do {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (isClick && (currentNode as any).disabled) {
        return
      }

      if (currentNode[eventPropName]) {
        setTarget(currentNode as Element)
        applyElementHandler(delegationHandler, event, eventPropName, currentNode as Element)
        if (event.cancelBubble) return
      }
      currentNode = currentNode.parentNode
    } while (currentNode !== null)
  }
}
