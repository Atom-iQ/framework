import { ReactiveEventDelegationHandler } from '../../shared/types/reactive-event-delegation/event-delegation'
import { RedEvent, SyntheticEventName } from '../../shared/types'
import { of } from 'rxjs'
import { filter, switchMap } from 'rxjs/operators'
import { fromSyntheticEvent } from '../synthetic-event/from-synthetic-event'
import { applyElementHandlers, eventPropertiesManager, getTarget } from './utils'

export function initBubblingHandler(
  eventName: SyntheticEventName,
  rootElement: Element,
  handler?: ReactiveEventDelegationHandler
): ReactiveEventDelegationHandler {
  const propertiesManager = eventPropertiesManager(rootElement)

  const isClick = eventName === 'click' || eventName === 'dblclick'

  handler = handler || {}

  handler.bubbleCount = 0
  handler.bubbleSub = switchMap(
    bubbleEvents(handler, '$$' + eventName, isClick, propertiesManager.setCurrentTarget)
  )(
    filter<RedEvent>(Boolean)(
      fromSyntheticEvent(rootElement, eventName, propertiesManager, isClick)
    )
  ).subscribe()

  return handler
}

function bubbleEvents(
  delegationHandler: ReactiveEventDelegationHandler,
  eventPropName: string,
  isClick: boolean,
  setTarget: (target: Element) => void,
  parentNode?: Node
) {
  return function bubble(event: RedEvent) {
    let currentNode = parentNode !== undefined ? parentNode : getTarget(event)

    do {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (isClick && (currentNode as any).disabled) {
        return of<null>(null)
      }

      if (currentNode[eventPropName]) {
        setTarget(currentNode as Element)
        const event$ = applyElementHandlers(
          delegationHandler,
          event,
          eventPropName,
          currentNode as Element
        )

        return switchMap(
          bubbleEvents(delegationHandler, eventPropName, isClick, setTarget, currentNode.parentNode)
        )(filter((event: RedEvent) => event && !event.isPropagationStopped())(event$))
      }
      currentNode = currentNode.parentNode
    } while (currentNode !== null)
    return of<RedEvent>(event)
  }
}
