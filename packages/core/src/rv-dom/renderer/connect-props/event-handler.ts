import {
  ClassicEventHandlerFn,
  ConnectPropCallback,
  DOMElementPropName,
  DOMEventHandlerPropName,
  RvdSyntheticEvent,
  RvdEventHandlerProp,
  RxEventHandler,
  SyntheticEventName
} from '../../../shared/types'
import { fromEvent, Subscription } from 'rxjs'
import { handleSyntheticEvent } from '../../event-delegation/event-delegation'

const isEventHandler = (propName: DOMElementPropName): propName is DOMEventHandlerPropName =>
  propName.startsWith('on')

const isRxEventHandler = (
  propName: DOMEventHandlerPropName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: RvdEventHandlerProp
): _ is RxEventHandler => propName.endsWith('$')

const getDOMEventName = (propName: DOMEventHandlerPropName): SyntheticEventName =>
  propName.substr(2).replace('$', '').toLowerCase() as SyntheticEventName

export const connectEventHandler = (
  element: Element,
  propsSubscription: Subscription
): ConnectPropCallback<RvdEventHandlerProp> => (propName, propValue) => {
  if (isEventHandler(propName)) {
    const eventName = getDOMEventName(propName)
    if (isRxEventHandler(propName, propValue)) {
      propsSubscription.add(handleSyntheticEvent(element, eventName, { rx: propValue }))
    } else {
      propsSubscription.add(handleSyntheticEvent(element, eventName, { fn: propValue }))
    }
  }
}
