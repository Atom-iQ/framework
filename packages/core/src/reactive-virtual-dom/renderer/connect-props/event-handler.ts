import {
  RvdDOMPropName,
  RvdDOMEventHandlerName,
  RedEvent,
  RvdEventHandlerProp,
  ReactiveEventHandler,
  SyntheticEventName,
  ClassicEventHandlerFn,
  ReactiveEventHandlerFn,
  ClassicEventHandler
} from '../../../shared/types'
import { Subscription, TeardownLogic } from 'rxjs'
import {
  handleSyntheticCaptureEvent,
  handleSyntheticEvent
} from '../../../reactive-event-delegation/event-delegation'
import { SyntheticEventHandlers } from '../../../shared/types/reactive-event-delegation/event-delegation'

export function connectEventHandler(
  propName: RvdDOMPropName,
  propValue: ClassicEventHandler<RedEvent> | ReactiveEventHandler<RedEvent>,
  element: Element,
  propsSubscription: Subscription
): void {
  if (isEventHandler(propName)) {
    propsSubscription.add(
      handleRedEvent(element, propName, propValue, isReactiveEventHandler(propName, propValue))
    )
  }
}

function handleRedEvent(
  element: Element,
  propName: RvdDOMEventHandlerName,
  handler: ClassicEventHandlerFn<RedEvent> | ReactiveEventHandlerFn<RedEvent>,
  isReactiveHandler = false
): TeardownLogic {
  const eventName = getEventName(propName, isReactiveHandler)
  const handlers: SyntheticEventHandlers = isReactiveHandler
    ? { rx: handler as ReactiveEventHandlerFn<RedEvent> }
    : { fn: handler as ClassicEventHandlerFn<RedEvent> }
  if (handler.options && handler.options.capture) {
    return handleSyntheticCaptureEvent(element, eventName, handlers)
  }
  return handleSyntheticEvent(element, eventName, handlers)
}

function isEventHandler(propName: RvdDOMPropName): propName is RvdDOMEventHandlerName {
  return propName.charCodeAt(0) === 111 && propName.charCodeAt(1) === 110
}

function isReactiveEventHandler(
  propName: RvdDOMEventHandlerName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: RvdEventHandlerProp
): _ is ReactiveEventHandler<RedEvent> {
  return propName.endsWith('$')
}

function getEventName(
  propName: RvdDOMEventHandlerName,
  isReactiveHandler = false
): SyntheticEventName {
  return (isReactiveHandler
    ? propName.substr(2).replace('$', '')
    : propName.substr(2)
  ).toLowerCase() as SyntheticEventName
}
