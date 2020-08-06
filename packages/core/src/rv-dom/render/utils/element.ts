import {fromEvent, isObservable, Subscription} from 'rxjs'
import {
  RxSub,
  RvdDOMElement
} from '@@types'
import {
  isFunction,
  isStringOrNumber
} from '@@shared'


export function connectElementProps(
  rvdElement: RvdDOMElement,
  element: Element
): RxSub {
  const propsSubscription = new Subscription()
  if (rvdElement.props) {
    Object.keys(rvdElement.props).forEach(propName => {
      const prop = rvdElement.props[propName]
      if (isObservable(prop)) {
        const attrSub = prop.subscribe(propValue => {
          element.setAttribute(propName, String(propValue))
        })
        propsSubscription.add(attrSub)
      } else if (isFunction(prop)) {
        if (propName.startsWith('on')) {
          const eventName = propName.slice(2).toLocaleLowerCase()
          const eventSub = fromEvent(element, eventName)
            .subscribe(event => prop(event))
          propsSubscription.add(eventSub)
        }
      } else if (isStringOrNumber(prop)) {
        element.setAttribute(propName, String(prop))
      }
    })
  }
  return propsSubscription
}

