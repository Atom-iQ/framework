import type {
  EventCapturePropName,
  EventPropName,
  RvdEvent,
  RvdEventHandlerFn,
  ReactiveEventDelegationHandler,
  EventTargetManager
} from 'types'

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
