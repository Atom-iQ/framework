import {
  ConnectPropCallback,
  DOMElementPropName,
  DOMEventHandlerPropName,
  RvdSyntheticEvent,
  RvdEventHandlerProp,
  RxEventHandler,
  SyntheticEventName
} from '../../../shared/types'
import { Subscription } from 'rxjs'
import {
  handleSyntheticCaptureEvent,
  handleSyntheticEvent
} from '../../event-delegation/event-delegation'

export function connectEventHandler(
  element: Element,
  propsSubscription: Subscription
): ConnectPropCallback<RvdEventHandlerProp> {
  return function connectProp(propName, propValue): void {
    if (isEventHandler(propName)) {
      if (isReactiveEventHandler(propName, propValue)) {
        if (isCaptureEventHandler(propName, true)) {
          propsSubscription.add(
            handleSyntheticCaptureEvent(element, getCaptureEventName(propName, true), {
              rx: propValue
            })
          )
        } else {
          propsSubscription.add(
            handleSyntheticEvent(element, getEventName(propName, true), { rx: propValue })
          )
        }
      } else {
        if (isCaptureEventHandler(propName)) {
          propsSubscription.add(
            handleSyntheticCaptureEvent(element, getEventName(propName), { fn: propValue })
          )
        } else {
          propsSubscription.add(
            handleSyntheticEvent(element, getEventName(propName), { fn: propValue })
          )
        }
      }
    }
  }
}

function isEventHandler(propName: DOMElementPropName): propName is DOMEventHandlerPropName {
  return propName.startsWith('on')
}

function isReactiveEventHandler(
  propName: DOMEventHandlerPropName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: RvdEventHandlerProp
): _ is RxEventHandler<RvdSyntheticEvent> {
  return propName.endsWith('$')
}

function isCaptureEventHandler(
  propName: DOMEventHandlerPropName,
  isReactiveHandler = false
): boolean {
  return propName.endsWith(isReactiveHandler ? 'Capture$' : 'Capture')
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

function getCaptureEventName(
  propName: DOMEventHandlerPropName,
  isReactiveHandler = false
): SyntheticEventName {
  return (isReactiveHandler
    ? propName.substr(2).replace('Capture$', '')
    : propName.substr(2).replace('Capture', '')
  ).toLowerCase() as SyntheticEventName
}
