import { isObservable, observer } from '@atom-iq/rx'

import { CSSProperties, RvdElementNode } from 'types'
import { isNullOrUndef, isString } from 'shared'

export function connectStyleProp(rvdElement: RvdElementNode): void {
  const styles = rvdElement.props.style
  if (isObservable(styles)) {
    rvdElement.sub.add(styles.subscribe(observer(s => setStyle(s, rvdElement))))
  } else {
    setStyle(styles, rvdElement)
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
      let prev: CSSProperties[keyof CSSProperties]
      rvdElement.sub.add(
        propValue.subscribe(
          observer(v => v !== prev && (rvdElement.dom.style[propName] = prev = v))
        )
      )
    } else {
      rvdElement.dom.style[propName] = propValue
    }
  }
}
