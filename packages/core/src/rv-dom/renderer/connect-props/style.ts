import { ConnectPropCallback, CSSProperties, RvdStyleProp } from '../../../shared/types'
import { isObservable, Subscription } from 'rxjs'
import { isNullOrUndef, isString, objectLoop } from '../../../shared'

const transformCssToJss = (cssPropName: keyof CSSProperties): keyof CSSStyleDeclaration => {
  return cssPropName as keyof CSSStyleDeclaration
}

const connectCssProperties = (
  styles: CSSProperties,
  element: HTMLElement | SVGElement,
  propsSubscription: Subscription
) => {
  objectLoop(styles, (propValue, propName) => {
    const parsedCssPropName = (propName as string).includes('-')
      ? transformCssToJss(propName)
      : propName
    if (isObservable(propValue)) {
      propsSubscription.add(
        propValue.subscribe(cssValue => {
          element.style[parsedCssPropName] = cssValue
        })
      )
    } else {
      element.style[parsedCssPropName] = propValue
    }
  })
}

export const connectStyleProp = (
  element: HTMLElement | SVGElement,
  propsSubscription: Subscription
): ConnectPropCallback<RvdStyleProp> => (propName, propValue) => {
  const setStyle = (isObservableProp = false) => (styles: string | CSSProperties) => {
    if (isString(styles)) {
      element.setAttribute('style', styles)
    } else if (!isNullOrUndef(styles)) {
      connectCssProperties(styles, element, propsSubscription)
    } else if (isObservableProp) {
      element.removeAttribute('style')
    }
  }

  if (isObservable(propValue)) {
    propsSubscription.add(propValue.subscribe(setStyle(true)))
  } else {
    setStyle()(propValue)
  }
}
