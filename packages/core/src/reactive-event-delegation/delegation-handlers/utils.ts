import type {
  EventPropertiesManager,
  ReactiveEventDelegationHandler,
  SyntheticEventPropertiesWrapper
} from '../../shared/types/rv-dom/event-delegation'
import { RedEvent } from '../../shared/types'
import { SyntheticEventHandlers } from '../../shared/types/rv-dom/event-delegation'
import { Observable, of } from 'rxjs'
import { tap } from 'rxjs/operators'
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

export function applyElementHandlers(
  delegationHandler: ReactiveEventDelegationHandler,
  event: RedEvent,
  eventPropName: string,
  targetElement: Element,
  countField: 'bubbleCount' | 'captureCount' | 'passiveCount' = 'bubbleCount',
  handlers?: SyntheticEventHandlers
): Observable<RedEvent> {
  handlers = handlers || targetElement[eventPropName]

  if (handlers.rx && handlers.fn) {
    if (hasOnceOption(handlers, 'any')) {
      return tap<RedEvent>(event => {
        handlers.fn(event)
        if (hasOnceOption(handlers, 'both')) {
          delete targetElement[eventPropName]
          --delegationHandler[countField]
        } else if (hasOnceOption(handlers, 'fn')) {
          delete targetElement[eventPropName].fn
        } else {
          delete targetElement[eventPropName].rx
        }
      })(handlers.rx(of<RedEvent>(event)))
    }
    return tap(handlers.fn)(handlers.rx(of<RedEvent>(event)))
  } else if (handlers.rx) {
    if (hasOnceOption(handlers, 'rx')) {
      return tap<RedEvent>(() => {
        delete targetElement[eventPropName]
        --delegationHandler[countField]
      })(handlers.rx(of<RedEvent>(event)))
    }
    return handlers.rx(of<RedEvent>(event))
  } else {
    if (hasOnceOption(handlers, 'fn')) {
      return tap<RedEvent>(event => {
        handlers.fn(event)
        delete targetElement[eventPropName]
        --delegationHandler[countField]
      })(of<RedEvent>(event))
    }
    return tap(handlers.fn)(of<RedEvent>(event))
  }
}

export function hasOnceOption(
  handlers: SyntheticEventHandlers,
  type: 'rx' | 'fn' | 'both' | 'any'
): boolean {
  switch (type) {
    case 'any':
      return (
        (handlers.rx && handlers.rx.options && handlers.rx.options.once) ||
        (handlers.fn && handlers.fn.options && handlers.fn.options.once)
      )
    case 'both':
      return (
        handlers.rx &&
        handlers.rx.options &&
        handlers.rx.options.once &&
        handlers.fn &&
        handlers.fn.options &&
        handlers.fn.options.once
      )
    case 'rx':
      return handlers.rx && handlers.rx.options && handlers.rx.options.once
    case 'fn':
      return handlers.fn && handlers.fn.options && handlers.fn.options.once
  }
}

export function getTarget(event: RedEvent): Node {
  return (isFunction(event.composedPath) ? event.composedPath()[0] : event.target) as Node
}
