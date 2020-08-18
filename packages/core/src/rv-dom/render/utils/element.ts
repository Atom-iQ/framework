import { fromEvent, isObservable, Subscription } from 'rxjs'
import {
  RxSub,
  RvdDOMElement,
  RxEventHandler,
  RvdEvent,
  attributes,
  RvdObservableDOMProp
} from '@@types'
import {
  isFunction,
  isStringOrNumber
} from '@@shared'
import { map } from 'rxjs/operators'

import DOMAttributes = attributes.DOMAttributes

type DOMElementProps = RvdDOMElement['props']
type DOMElementPropName = keyof DOMElementProps | 'key' | 'ref'
type DOMEventHandlerPropName =
  keyof Omit<DOMAttributes<Element>, 'children' | 'dangerouslySetInnerHTML'>

const isEventHandler = (propName: DOMElementPropName): propName is DOMEventHandlerPropName =>
  propName.startsWith('on')

const connectEventProp = (
  propName: DOMElementPropName,
  prop: Function,
  rvdElement: RvdDOMElement,
  element: Element
): RxSub => {
  if (isEventHandler(propName)) {
    if (propName.endsWith('$')) {
      const classicHandlerName = propName.substr(0, propName.length - 1)
      const eventName = classicHandlerName.slice(2).toLocaleLowerCase()
      const event$ = (prop as RxEventHandler)(map<Event, RvdEvent<Element>>(
        event => Object.assign({ element }, event)
      )(fromEvent(element, eventName)))
      return event$.subscribe(event => {
        if (rvdElement.props[classicHandlerName]) {
          rvdElement.props[classicHandlerName](event)
        }
      })
    } else {
      if (rvdElement.props[`${propName}$`]) {
        return
      }

      const eventName = propName.slice(2).toLocaleLowerCase()
      return fromEvent(element, eventName)
        .subscribe(event => prop(event))
    }
  }
}

const connectAttributeProp = (
  propName: DOMElementPropName,
  prop: string | number,
  rvdElement: RvdDOMElement,
  element: Element
) => {
  element.setAttribute(propName, String(prop))
}

const connectStyleProp = (
  propName: DOMElementPropName,
  prop: string | number,
  rvdElement: RvdDOMElement,
  element: Element
) => {
  // TODO
}

const connectObservableProp = (
  propName: DOMElementPropName,
  prop: RvdObservableDOMProp,
  rvdElement: RvdDOMElement,
  element: Element
): RxSub => {
  if (propName === 'style') {
    return prop.subscribe(cssProps => {
      connectStyleProp(propName, cssProps, rvdElement, element)
    }, error => {
      console.error(error)
    })
  }

  return prop.subscribe(propValue => {
    connectAttributeProp(propName, propValue, rvdElement, element)
    console.log(propValue)
  }, error => {
    console.error(error)
  })
}

const isSpecialProp = (propName: string) => propName === 'children' ||
  propName === 'key' || propName === 'ref'

export function connectElementProps(
  rvdElement: RvdDOMElement,
  element: Element
): RxSub {
  const propsSubscription = new Subscription()
  if (rvdElement.props) {
    Object.keys(rvdElement.props).forEach((propName: DOMElementPropName) => {
      if (isSpecialProp(propName)) return


      const prop = rvdElement.props[propName]
      if (isObservable(prop)) {
        propsSubscription.add(connectObservableProp(propName, prop, rvdElement, element))
      } else if (isFunction(prop)) {
        propsSubscription.add(connectEventProp(propName, prop, rvdElement, element))
      } else if (isStringOrNumber(prop)) {
        connectAttributeProp(propName, prop, rvdElement, element)
      }
    })
  }
  return propsSubscription
}

