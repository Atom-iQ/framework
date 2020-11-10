import { CSSProperties, RvdStyleProp } from '../../../shared/types'
import { isObservable, Subscription } from 'rxjs'
import { isNullOrUndef, isString } from '../../../shared'
import { rvdObserver } from '../utils'

export function connectStyleProp(
  propValue: RvdStyleProp,
  element: HTMLElement | SVGElement,
  propsSubscription: Subscription
): void {
  function setStyle(styles: string | CSSProperties) {
    if (isString(styles)) {
      element.setAttribute('style', styles)
    } else if (!isNullOrUndef(styles)) {
      connectCssProperties(styles, element, propsSubscription)
    } else {
      element.removeAttribute('style')
    }
  }

  if (isObservable(propValue)) {
    propsSubscription.add(propValue.subscribe(rvdObserver(setStyle)))
  } else {
    setStyle(propValue)
  }
}

function connectCssProperties(
  styles: CSSProperties,
  element: HTMLElement | SVGElement,
  propsSubscription: Subscription
): void {
  for (const propName in styles) {
    const propValue = styles[propName]
    if (isObservable(propValue)) {
      propsSubscription.add(
        propValue.subscribe(
          rvdObserver(function (cssValue: string | number) {
            element.style[propName] = cssValue
          })
        )
      )
    } else {
      element.style[propName] = propValue
    }
  }
}
