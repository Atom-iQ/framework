import {
  CurrentTargetManager,
  EventDelegationHandler,
  SyntheticEventHandlers
} from '../../shared/types/rv-dom/event-delegation'
import { RvdSyntheticEvent, SyntheticEventName } from '../../shared/types'
import { Observable, of, pipe } from 'rxjs'
import { filter, switchMap, tap } from 'rxjs/operators'
import { fromSyntheticEvent } from './from-synthetic-event'
import { isFunction } from '../../shared'

export function initSyntheticEvent(
  eventName: SyntheticEventName,
  rootElement: Element
): EventDelegationHandler {
  const connectedHandlers = new WeakMap<Element, SyntheticEventHandlers>()

  const { setCurrentTarget, getCurrentTarget } = currentTargetManager(rootElement)

  const isClick = eventName === 'click' || eventName === 'dblclick'

  const eventSubscription = pipe(
    switchMap(bubbleEvents(isClick, connectedHandlers, setCurrentTarget)),
    filter(Boolean)
  )(fromSyntheticEvent(rootElement, eventName, getCurrentTarget, isClick)).subscribe()

  return { eventSubscription, connectedHandlers, connectedElementsCount: 0 }
}

function currentTargetManager(rootTarget: Element): CurrentTargetManager {
  const wrapper = {
    currentTarget: rootTarget
  }

  return {
    getCurrentTarget: () => wrapper.currentTarget,
    setCurrentTarget: (currentTarget: Element) => (wrapper.currentTarget = currentTarget)
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
        const handlers = connectedHandlers.get(currentNode as Element)
        setTarget(currentNode as Element)
        let event$: Observable<RvdSyntheticEvent>
        if (handlers.rx && handlers.fn) {
          event$ = tap(handlers.fn)(handlers.rx(of<RvdSyntheticEvent>(event)))
        } else if (handlers.rx) {
          event$ = handlers.rx(of<RvdSyntheticEvent>(event))
        } else {
          event$ = tap(handlers.fn)(of<RvdSyntheticEvent>(event))
        }

        return event$.pipe(
          filter((event: RvdSyntheticEvent) => event && !event.isPropagationStopped()),
          switchMap(bubbleEvents(isClick, connectedHandlers, setTarget, currentNode.parentNode))
        )
      }
      currentNode = currentNode.parentNode
    } while (currentNode !== null)
    return of<null>(null)
  }
}

function getTarget(event: RvdSyntheticEvent): Node {
  return (isFunction(event.composedPath) ? event.composedPath()[0] : event.target) as Node
}
