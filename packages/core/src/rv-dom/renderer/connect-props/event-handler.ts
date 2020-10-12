import {
  ClassicEventHandlerFn,
  ConnectPropCallback,
  DOMElementPropName,
  DOMEventHandlerPropName,
  RvdDOMElement,
  RvdEvent,
  RvdEventHandlerProp,
  RxEventHandler,
  RxSub
} from '../../../shared/types'
import { fromEvent } from 'rxjs'

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
  rvdElement: RvdDOMElement,
  element: Element,
  propsSubscription: RxSub
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
