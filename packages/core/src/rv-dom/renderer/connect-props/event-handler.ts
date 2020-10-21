import {
  ClassicEventHandlerFn,
  ConnectPropCallback,
  DOMElementPropName,
  DOMEventHandlerPropName,
  RvdEvent,
  RvdEventHandlerProp,
  RxEventHandler
} from '../../../shared/types'
import { fromEvent, Subscription } from 'rxjs'

const isEventHandler = (propName: DOMElementPropName): propName is DOMEventHandlerPropName =>
  propName.startsWith('on')

const isRxEventHandler = (
  propName: DOMEventHandlerPropName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: RvdEventHandlerProp
): _ is RxEventHandler => propName.endsWith('$')

const getDOMEventName = (propName: DOMEventHandlerPropName) =>
  propName.substr(2).replace('$', '').toLowerCase()

export const connectEventHandler = (
  element: Element,
  propsSubscription: Subscription
): ConnectPropCallback<RvdEventHandlerProp> => (propName, propValue) => {
  if (isEventHandler(propName)) {
    const event$ = fromEvent<RvdEvent<Element>>(element, getDOMEventName(propName))
    if (isRxEventHandler(propName, propValue)) {
      propsSubscription.add(propValue(event$).subscribe())
    } else {
      propsSubscription.add(event$.subscribe(event => (propValue as ClassicEventHandlerFn)(event)))
    }
  }
}
