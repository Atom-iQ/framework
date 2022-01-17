import { Observer } from '@atom-iq/rx'

import type {
  EventTargetManager,
  ReactiveEventDelegationContainer,
  ReactiveEventDelegationHandler,
  EventPropName,
  RvdEvent,
  RvdSyntheticEventName
} from 'types'
import { AtomiqObserver } from 'renderer/utils'
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
  ).subscribe(new BubblingDelegationObserver(handler, eventName, isClick, currentTarget.set))

  delegationContainer[eventName] = handler
}

class BubblingDelegationObserver extends AtomiqObserver<RvdEvent> implements Observer<RvdEvent> {
  private readonly h: ReactiveEventDelegationHandler
  private readonly n: EventPropName
  private readonly c: boolean
  private readonly t: EventTargetManager['set']

  constructor(
    handler: ReactiveEventDelegationHandler,
    eventName: RvdSyntheticEventName,
    isClick: boolean,
    setCurrentTarget: EventTargetManager['set']
  ) {
    super()
    this.h = handler
    this.n = `$$${eventName}`
    this.c = isClick
    this.t = setCurrentTarget
  }

  next(event: RvdEvent) {
    if (event.composedPath) this.bubbleWithComposedPath(event)
    else this.bubbleLegacy(event)
  }

  bubbleWithComposedPath(event: RvdEvent): void {
    const composedPath = event.composedPath()
    for (let i = 0, l = composedPath.length; i < l; ++i) {
      const currentNode = composedPath[i]
      if (isDisabledClick(this.c, currentNode as Node)) return

      if (currentNode[this.n]) {
        applyElementHandler(this.h, event, this.n, this.t(currentNode as Element))
        if (event.cancelBubble) return
      }
    }
  }

  bubbleLegacy(event: RvdEvent) {
    let currentNode = event.target as Node

    do {
      if (isDisabledClick(this.c, currentNode)) return

      if (currentNode[this.n]) {
        applyElementHandler(this.h, event, this.n, this.t(currentNode as Element))
        if (event.cancelBubble) return
      }
      currentNode = currentNode.parentNode
    } while (currentNode !== null)
  }
}
