import type {
  EventPropertiesManager,
  ReactiveEventDelegationHandler,
  SyntheticEventPropertiesWrapper
} from '../../shared/types/reactive-event-delegation/event-delegation'
import { RvdAnyEventHandler, RvdEvent } from '../../shared/types'
import { isFunction } from '../../shared'

export function eventPropertiesManager(rootTarget: Element): EventPropertiesManager {
  const wrapper: SyntheticEventPropertiesWrapper = {
    currentTarget: rootTarget
  }

  return {
    getCurrentTarget: () => wrapper.currentTarget,
    setCurrentTarget: currentTarget => (wrapper.currentTarget = currentTarget)
  }
}

export function applyElementHandler(
  delegationHandler: ReactiveEventDelegationHandler,
  event: RvdEvent,
  eventPropName: string,
  targetElement: Element,
  countField: 'bubbleCount' | 'captureCount' | 'passiveCount' = 'bubbleCount',
  handler?: RvdAnyEventHandler
): void {
  handler = handler || targetElement[eventPropName]
  handler(event)
  if (handler.options && handler.options.once) {
    delete targetElement[eventPropName]
    if (--delegationHandler[countField] === 0) {
      delegationHandler[countField === 'bubbleCount' ? 'bubbleSub' : 'captureSub'].unsubscribe()
    }
  }
}

export function getTarget(event: RvdEvent): Node {
  return (isFunction(event.composedPath) ? event.composedPath()[0] : event.target) as Node
}
