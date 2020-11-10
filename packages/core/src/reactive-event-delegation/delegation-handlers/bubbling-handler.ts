import {
  ReactiveEventDelegationHandler,
  SyntheticEventHandlers
} from '../../shared/types/rv-dom/event-delegation'
import { RedEvent, SyntheticEventName } from '../../shared/types'
import { of } from 'rxjs'
import { filter, switchMap } from 'rxjs/operators'
import { fromSyntheticEvent } from '../synthetic-event/from-synthetic-event'
import { applyElementHandlers, eventPropertiesManager, getTarget } from './utils'

export function initBubblingHandler(
  eventName: SyntheticEventName,
  rootElement: Element,
  currentHandler?: ReactiveEventDelegationHandler
): ReactiveEventDelegationHandler {
  const propertiesManager = eventPropertiesManager(rootElement)

  const isClick = eventName === 'click' || eventName === 'dblclick'

  if (currentHandler) {
    currentHandler.connectedHandlers = new WeakMap<Element, SyntheticEventHandlers>()
    currentHandler.connectedHandlersCount = 0
    currentHandler.bubblingSubscription = switchMap(
      bubbleEvents(isClick, currentHandler.connectedHandlers, propertiesManager.setCurrentTarget)
    )(
      filter<RedEvent>(Boolean)(
        fromSyntheticEvent(rootElement, eventName, propertiesManager, isClick)
      )
    ).subscribe()

    return currentHandler
  } else {
    const connectedHandlers = new WeakMap<Element, SyntheticEventHandlers>()

    return {
      connectedHandlers,
      connectedHandlersCount: 0,
      bubblingSubscription: switchMap(
        bubbleEvents(isClick, connectedHandlers, propertiesManager.setCurrentTarget)
      )(
        filter<RedEvent>(Boolean)(
          fromSyntheticEvent(rootElement, eventName, propertiesManager, isClick)
        )
      ).subscribe()
    }
  }
}

function bubbleEvents(
  isClick: boolean,
  connectedHandlers: WeakMap<Element, SyntheticEventHandlers>,
  setTarget: (target: Element) => void,
  parentNode?: Node
) {
  return (event: RedEvent) => {
    let currentNode = parentNode !== undefined ? parentNode : getTarget(event)

    do {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (isClick && (currentNode as any).disabled) {
        return of<null>(null)
      }

      if (connectedHandlers.has(currentNode as Element)) {
        setTarget(currentNode as Element)
        const event$ = applyElementHandlers(event, currentNode as Element, connectedHandlers)

        return switchMap(
          bubbleEvents(isClick, connectedHandlers, setTarget, currentNode.parentNode)
        )(filter((event: RedEvent) => event && !event.isPropagationStopped())(event$))
      }
      currentNode = currentNode.parentNode
    } while (currentNode !== null)
    return of<RedEvent>(event)
  }
}
