import { CSSProperties, RvdElementNode } from 'types'
import { isObservable } from '../utils'
import { isNullOrUndef, isString } from 'shared'

export function connectStyleProp(rvdElement: RvdElementNode): void {
  const propValue = rvdElement.props.style
  if (isObservable(propValue)) {
    rvdElement.sub.add(propValue.subscribe(styles => setStyle(styles, rvdElement)))
  } else {
    setStyle(propValue, rvdElement)
  }
}

function setStyle(styles: string | CSSProperties, rvdElement: RvdElementNode) {
  if (isString(styles)) {
    rvdElement.dom.setAttribute('style', styles)
  } else if (!isNullOrUndef(styles)) {
    connectCssProperties(styles, rvdElement)
  } else {
    rvdElement.dom.removeAttribute('style')
  }
}

function connectCssProperties(styles: CSSProperties, rvdElement: RvdElementNode): void {
  for (const propName in styles) {
    const propValue = styles[propName]
    if (isObservable(propValue)) {
      rvdElement.sub.add(
        propValue.subscribe(function (cssValue: string | number) {
          rvdElement.dom.style[propName] = cssValue
        })
      )
    } else {
      rvdElement.dom.style[propName] = propValue
    }
  }
}
