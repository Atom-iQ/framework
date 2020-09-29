import { fromEvent, isObservable, Subscription } from 'rxjs'
import {
  RxSub,
  RvdDOMElement,
  RxEventHandler,
  RvdEvent,
  DOMElementPropName,
  DOMEventHandlerPropName,
  PropEntryCallback,
  ConnectPropCallback,
  CSSProperties,
  RvdStyleProp,
  RvdElementProp,
  DOMElementConnectableProp,
  RvdEventHandlerProp,
  ClassicEventHandlerFn,
  RvdDOMProp,
  RvdChild,
  RxO
} from '../../shared/types'
import {
  isBoolean,
  isFunction,
  isNullOrUndef,
  isString
} from '../../shared'
import { map } from 'rxjs/operators'

const transformCssToJss = (cssPropName: keyof CSSProperties): keyof CSSStyleDeclaration => {
  return cssPropName as keyof CSSStyleDeclaration
}

const connectCssProperties = (
  styles: CSSProperties,
  element: HTMLElement | SVGElement,
  propsSubscription: RxSub
) => {
  Object.entries(styles).forEach(([cssPropName, cssPropValue]) => {
    const parsedCssPropName = cssPropName.includes('-') ?
      transformCssToJss(cssPropName) :
      cssPropName
    if (isObservable(cssPropValue)) {
      propsSubscription.add(
        cssPropValue.subscribe(cssValue => {
          element.style[parsedCssPropName] = cssValue
        })
      )
    } else {
      element.style[parsedCssPropName] = cssPropValue
    }
  })
}


const connectStyleProp = (
  rvdElement: RvdDOMElement,
  element: HTMLElement | SVGElement,
  propsSubscription: RxSub
): ConnectPropCallback<RvdStyleProp> => (propName, propValue) => {
  if (isObservable(propValue)) {
    propsSubscription.add(
      propValue.subscribe(styles => {
        if (isString(styles)) {
          element.setAttribute('style', styles)
        } else if (isNullOrUndef(styles)) {
          element.removeAttribute('style')
        } else {
          connectCssProperties(styles, element, propsSubscription)
        }
      })
    )
  } else if (isString(propValue)) {
    element.setAttribute('style', propValue)
  } else if (!isNullOrUndef(propValue)) {
    connectCssProperties(propValue, element, propsSubscription)
  }
}

const isEventHandler = (propName: DOMElementPropName): propName is DOMEventHandlerPropName =>
  propName.startsWith('on')

const isRxEventHandler = (
  propName: DOMEventHandlerPropName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: RvdEventHandlerProp
): _ is RxEventHandler => propName.endsWith('$')


const connectEventProp = (
  rvdElement: RvdDOMElement,
  element: Element,
  propsSubscription: RxSub
): ConnectPropCallback<RvdEventHandlerProp> => (propName, propValue) => {
  if (isEventHandler(propName)) {
    if (isRxEventHandler(propName, propValue)) {
      const classicHandlerName = propName.substr(0, propName.length - 1)
      const eventName = classicHandlerName.slice(2).toLocaleLowerCase()

      const event$ = map<Event, RvdEvent<Element>>(
        event => Object.assign({ element }, event)
      )(fromEvent(element, eventName))

      propsSubscription.add(
        propValue(event$).subscribe(event => {
          if (rvdElement.props[classicHandlerName]) {
            rvdElement.props[classicHandlerName](event)
          }
        })
      )
    } else {
      if (rvdElement.props[`${propName}$`]) {
        return
      }

      const eventName = propName.slice(2).toLocaleLowerCase()
      const event$ = map<Event, RvdEvent<Element>>(
        event => Object.assign({ element }, event)
      )(fromEvent(element, eventName))

      propsSubscription.add(
        event$.subscribe(event => (propValue as ClassicEventHandlerFn)(event))
      )
    }
  }
}

const connectDOMProp = (
  rvdElement: RvdDOMElement,
  element: Element
): ConnectPropCallback<Exclude<RvdDOMProp, RvdChild[]>> => (propName, propValue) => {
  const name = propName === 'class' ? 'className' : propName
  if (name === 'className') {
    if (isNullOrUndef(propValue)) {
      element.className = ''
    } else {
      element.className = String(propValue)
    }
  } else {
    if (isNullOrUndef(propValue)) {
      element.removeAttribute(name)
    } else if (isBoolean(propValue)) {
      if (propValue) {
        element.setAttribute(name, name)
      } else {
        element.removeAttribute(name)
      }
    } else {
      element.setAttribute(name, String(propValue))
    }
  }
}

type ObservableProp = RxO<Exclude<RvdDOMProp, RvdChild[]>>

const connectObservableProp = (
  rvdElement: RvdDOMElement,
  element: Element,
  propsSubscription: RxSub
): ConnectPropCallback<ObservableProp> => (propName, observableProp) => {
  propsSubscription.add(
    observableProp.subscribe(propValue => {
      connectDOMProp(rvdElement, element)(propName, propValue)
    })
  )
}



const isSpecialProp = (propName: string): propName is 'children' | 'key' | 'ref' =>
  propName === 'children' || propName === 'key' || propName === 'ref'

const isStyleProp = (
  propName: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: RvdElementProp
): _ is RvdStyleProp => propName === 'style'

const connectProp = (
  styleCallback: ConnectPropCallback,
  eventCallback: ConnectPropCallback,
  observableCallback: ConnectPropCallback,
  staticCallback: ConnectPropCallback
): PropEntryCallback => ([propName, propValue]) =>  {
  if (isSpecialProp(propName)) return
  if (isStyleProp(propName, propValue)) return styleCallback(propName, propValue)
  if (isFunction(propValue)) return eventCallback(propName, propValue)
  if (isObservable(propValue)) return observableCallback(propName, propValue)
  return staticCallback(propName, (propValue as DOMElementConnectableProp))
}

/**
 * Connecting element props - just set static props and subscribe to observable props
 * @param rvdElement
 * @param element
 */
export function connectElementProps(
  rvdElement: RvdDOMElement,
  element: HTMLElement | SVGElement
): RxSub {
  const propsSubscription = new Subscription()
  if (rvdElement.props) {
    Object.entries(rvdElement.props).forEach(connectProp(
      connectStyleProp(rvdElement, element, propsSubscription),
      connectEventProp(rvdElement, element, propsSubscription),
      connectObservableProp(rvdElement, element, propsSubscription),
      connectDOMProp(rvdElement, element)
    ))
  }
  return propsSubscription
}

