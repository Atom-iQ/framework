import type {
  ConnectPropCallback,
  DOMElementConnectableProp,
  DOMElementPropName,
  DOMFormElement,
  PropEntryCallback,
  RvdDOMElement,
  RvdStyleProp
} from '../../../shared/types'
import { isObservable, Subscription } from 'rxjs'
import { isFunction } from '../../../shared'
import { connectStyleProp } from './style'
import { connectEventHandler } from './event-handler'
import { connectDOMProp, connectObservableDOMProp } from './dom-prop'
import { connectControlledElement } from './controlled-elements/controlled-element'
import { isControlledFormElement } from '../utils'

const connectProp = (
  styleCallback: ConnectPropCallback,
  eventCallback: ConnectPropCallback,
  observableCallback: ConnectPropCallback,
  staticCallback: ConnectPropCallback
): PropEntryCallback => (propName, propValue) => {
  if (propName === 'style') return styleCallback(propName, propValue as RvdStyleProp)
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
): Subscription {
  const propsSubscription = new Subscription()

  const connect = connectProp(
    connectStyleProp(element, propsSubscription),
    connectEventHandler(element, propsSubscription),
    connectObservableDOMProp(element, propsSubscription),
    connectDOMProp(element)
  )
  if (isControlledFormElement(rvdElement)) {
    connectControlledElement(rvdElement, element as DOMFormElement, propsSubscription, connect)
  } else {
    for (const propName in rvdElement.props) {
      connect(propName as DOMElementPropName, rvdElement.props[propName])
    }
  }

  return propsSubscription
}
