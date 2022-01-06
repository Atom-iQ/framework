import type {
  ReactiveEventDelegationHandler,
  EventTargetManager
} from 'shared/types/reactive-event-delegation/event-delegation'
import { EventCapturePropName, EventPropName, RvdEvent, RvdEventHandlerFn } from 'types'

export const enum DelegationHandlerType {
  Bubble = 'bubble',
  Capture = 'capture'
}

export function currentTargetManager<Target extends EventTarget>(
  rootTarget: Target
): EventTargetManager<Target> {
  const wrapper = {
    currentTarget: rootTarget
  }
  return {
    get() {
      return wrapper.currentTarget
    },
    set(target) {
      return (wrapper.currentTarget = target)
    }
  }
}

export function applyElementHandler(
  delegationHandler: ReactiveEventDelegationHandler,
  event: RvdEvent,
  eventPropName: EventPropName | EventCapturePropName,
  targetElement: Element
): void | false {
  const handler: RvdEventHandlerFn<RvdEvent> = targetElement[eventPropName]
  handler(event, event.currentTarget)
  if (handler.options && handler.options.once) {
    delete targetElement[eventPropName]
  }
}

export function isDisabledClick(isClick: boolean, node: Node): boolean {
  return isClick && (node as unknown as { disabled: boolean }).disabled
}
