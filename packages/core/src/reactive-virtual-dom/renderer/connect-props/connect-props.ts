import type {
  DOMElementPropName,
  DOMFormElement,
  RvdElementNode,
  RvdElementProp,
  RvdStyleProp
} from '../../../shared/types'
import { isObservable, Subscription } from 'rxjs'
import { isFunction } from '../../../shared'
import { connectStyleProp } from './style'
import { connectEventHandler } from './event-handler'
import { connectDOMProp, connectObservableDOMProp } from './dom-prop'
import { connectControlledElement } from './controlled-elements/controlled-element'
import { isControlledFormElement } from '../utils'
// noinspection ES6PreferShortImport
import { RvdNodeFlags } from '../../../shared/flags'

/**
 * Connecting element props - just set static props and subscribe to observable props
 * @param rvdElement
 * @param element
 * @param isSvg
 * @param propsSubscription
 */
export function connectElementProps(
  rvdElement: RvdElementNode,
  isSvg: boolean,
  element: HTMLElement | SVGElement,
  propsSubscription: Subscription
): void {
  function connect(propName: string, propValue: RvdElementProp) {
    if (propName === 'style') {
      return connectStyleProp(propValue as RvdStyleProp, element, propsSubscription)
    }
    if (isFunction(propValue)) {
      return connectEventHandler(
        propName as DOMElementPropName,
        propValue,
        element,
        propsSubscription
      )
    }
    if (isObservable(propValue)) {
      return connectObservableDOMProp(
        propName as DOMElementPropName,
        propValue,
        element,
        propsSubscription
      )
    }

    return connectDOMProp(propName, propValue, element)
  }

  if (
    (RvdNodeFlags.FormElement & rvdElement.elementFlag) !== 0 &&
    isControlledFormElement(rvdElement)
  ) {
    connectControlledElement(rvdElement, element as DOMFormElement, propsSubscription, connect)
  } else {
    for (const propName in rvdElement.props) {
      // noinspection JSUnfilteredForInLoop
      connect(propName as DOMElementPropName, rvdElement.props[propName])
    }
  }
}
