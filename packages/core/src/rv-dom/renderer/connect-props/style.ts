import {
  ConnectPropCallback,
  CSSProperties,
  RvdElementProp,
  RvdStyleProp,
  RxSub
} from '../../../shared/types'
import { isObservable } from 'rxjs'
import { isNullOrUndef, isString } from '../../../shared'

const transformCssToJss = (cssPropName: keyof CSSProperties): keyof CSSStyleDeclaration => {
  return cssPropName as keyof CSSStyleDeclaration
}

const connectCssProperties = (
  styles: CSSProperties,
  element: HTMLElement | SVGElement,
  propsSubscription: RxSub
) => {
  Object.entries(styles).forEach(([cssPropName, cssPropValue]) => {
    const parsedCssPropName = cssPropName.includes('-')
      ? transformCssToJss(cssPropName)
      : cssPropName
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

export const connectStyleProp = (
  element: HTMLElement | SVGElement,
  propsSubscription: RxSub
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

export const isStyleProp = (
  propName: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: RvdElementProp
): _ is RvdStyleProp => propName === 'style'
