import type {
  ConnectPropCallback,
  DOMElementConnectableProp,
  DOMFormElement,
  PropEntryCallback,
  RvdDOMElement,
  RxSub
} from '../../../shared/types'
import { isObservable, Subscription } from 'rxjs'
import { isFunction } from '../../../shared'
import { connectClassName } from './class-name'
import { connectStyleProp, isStyleProp } from './style'
import { connectEventHandler } from './event-handler'
import { connectDOMProp, connectObservableDOMProp } from './dom-prop'
import { connectControlledElement } from './controlled-elements/controlled-element'
import { isControlledFormElement } from '../utils'

const connectProp = (
  styleCallback: ConnectPropCallback,
  eventCallback: ConnectPropCallback,
  observableCallback: ConnectPropCallback,
  staticCallback: ConnectPropCallback
): PropEntryCallback => ([propName, propValue]) => {
  if (isStyleProp(propName, propValue)) return styleCallback(propName, propValue)
  if (isFunction(propValue)) return eventCallback(propName, propValue)
  if (isObservable(propValue)) return observableCallback(propName, propValue)
  return staticCallback(propName, propValue as DOMElementConnectableProp)
}

/**
 * Connecting element props - just set static props and subscribe to observable props
 * @param rvdElement
 * @param element
 * @param isSvg
 */
export function connectElementProps(
  rvdElement: RvdDOMElement,
  isSvg: boolean,
  element: HTMLElement | SVGElement
): RxSub {
  const propsSubscription = new Subscription()

  if (rvdElement.className) {
    connectClassName(rvdElement.className, isSvg, element, propsSubscription)
  }

  if (rvdElement.props) {
    const connect = connectProp(
      connectStyleProp(element, propsSubscription),
      connectEventHandler(element, propsSubscription),
      connectObservableDOMProp(element, propsSubscription),
      connectDOMProp(element)
    )
    if (isControlledFormElement(rvdElement)) {
      connectControlledElement(rvdElement, element as DOMFormElement, propsSubscription, connect)
    } else {
      Object.entries(rvdElement.props).forEach(connect)
    }
  }
  return propsSubscription
}
