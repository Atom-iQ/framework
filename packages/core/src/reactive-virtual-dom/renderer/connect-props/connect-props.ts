import type {
  RvdDOMPropName,
  DOMFormElement,
  RvdElementNode,
  RvdElementProp,
  RvdStyleProp,
  RvdAnyEventHandler
} from 'types'
import { isObservable, Subscription } from 'rxjs'
import { connectStyleProp } from './style'
import { connectDOMProp, connectObservableDOMProp } from './dom-prop'
import { connectControlledElement } from './controlled-elements/controlled-element'
import { isControlledFormElement } from '../utils'
// noinspection ES6PreferShortImport
import { RvdNodeFlags } from '../../../shared/flags'
import { RvdDOMEventHandlerName } from 'types'
import { handleRedEvent } from 'red/event-delegation'

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
    if (isEventHandler(propName)) {
      if (!propValue) return

      return propsSubscription.add(
        handleRedEvent(element, propName, propValue as RvdAnyEventHandler)
      )
    }
    if (isObservable(propValue)) {
      return connectObservableDOMProp(
        propName as RvdDOMPropName,
        propValue,
        element,
        propsSubscription
      )
    }

    return connectDOMProp(propName, propValue, element)
  }

  if ((RvdNodeFlags.FormElement & rvdElement.flag) !== 0 && isControlledFormElement(rvdElement)) {
    connectControlledElement(rvdElement, element as DOMFormElement, propsSubscription, connect)
  } else {
    for (const propName in rvdElement.props) {
      // noinspection JSUnfilteredForInLoop
      connect(propName as RvdDOMPropName, rvdElement.props[propName])
    }
  }
}

function isEventHandler(propName: string): propName is RvdDOMEventHandlerName {
  return propName.charCodeAt(0) === 111 && propName.charCodeAt(1) === 110
}
