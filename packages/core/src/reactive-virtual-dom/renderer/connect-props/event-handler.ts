import {
  DOMElementPropName,
  DOMEventHandlerPropName,
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
import { SyntheticEventHandlers } from '../../../shared/types/rv-dom/event-delegation'

export function connectEventHandler(
  propName: DOMElementPropName,
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
  propName: DOMEventHandlerPropName,
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

function isEventHandler(propName: DOMElementPropName): propName is DOMEventHandlerPropName {
  return propName.charCodeAt(0) === 111 && propName.charCodeAt(1) === 110
}

function isReactiveEventHandler(
  propName: DOMEventHandlerPropName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: RvdEventHandlerProp
): _ is ReactiveEventHandler<RedEvent> {
  return propName.endsWith('$')
}

function getEventName(
  propName: DOMEventHandlerPropName,
  isReactiveHandler = false
): SyntheticEventName {
  return (isReactiveHandler
    ? propName.substr(2).replace('$', '')
    : propName.substr(2)
  ).toLowerCase() as SyntheticEventName
}
