import { Observer } from '@atom-iq/rx'
import {
  EventCapturePropName,
  RvdEvent,
  RvdSyntheticEventName,
  ReactiveEventDelegationHandler,
  EventTargetManager,
  ReactiveEventDelegationContainer
} from 'types'
import { AtomiqObserver } from 'renderer/utils'

import { fromSyntheticEvent } from '../synthetic-event/from-synthetic-event'

import { applyElementHandler, currentTargetManager } from './utils'

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
  }).subscribe(new CapturingDelegationObserver(handler, eventName, currentTarget.set))

  delegationContainer[eventName] = handler
}

class CapturingDelegationObserver extends AtomiqObserver<RvdEvent> implements Observer<RvdEvent> {
  private readonly h: ReactiveEventDelegationHandler
  private readonly n: EventCapturePropName
  private readonly t: EventTargetManager['set']

  constructor(
    handler: ReactiveEventDelegationHandler,
    eventName: RvdSyntheticEventName,
    setCurrentTarget: EventTargetManager['set']
  ) {
    super()
    this.h = handler
    this.n = `$$${eventName}Capture`
    this.t = setCurrentTarget
  }

  next(event: RvdEvent) {
    if (event.composedPath) this.captureWithComposedPath(event)
    else this.captureLegacy(event)
  }

  captureWithComposedPath(event: RvdEvent): void {
    const composedPath = event.composedPath()
    for (let i = composedPath.length - 1; i >= 0; --i) {
      const currentNode = composedPath[i]

      if (currentNode[this.n]) {
        applyElementHandler(this.h, event, this.n, this.t(currentNode as Element))
        if (event.cancelBubble) return
      }
    }
  }

  captureLegacy(event: RvdEvent): void {
    let currentNode = event.target as Node
    const capturingQueue: Element[] = []

    do {
      if (currentNode[this.n]) {
        capturingQueue.unshift(currentNode as Element)
      }

      currentNode = currentNode.parentNode
    } while (currentNode !== null)

    while (capturingQueue.length > 0) {
      applyElementHandler(this.h, event, this.n, this.t(capturingQueue.shift()))
      if (event.cancelBubble) return
    }
  }
}
