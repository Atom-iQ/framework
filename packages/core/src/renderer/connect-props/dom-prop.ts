import { observer } from '@atom-iq/rx'
import type { RvdDOMPropName, RvdDOMProp, RvdObservableDOMProp, RvdElementNode } from 'types'
import { isBoolean, isNullOrUndef } from 'shared'

export function connectDOMProp(propName: string, propValue: RvdDOMProp, element: Element): void {
  switch (propName) {
    case 'autoFocus':
      // eslint-disable-next-line @typescript-eslint/no-extra-semi, @typescript-eslint/no-explicit-any
      ;(element as any).autofocus = !!propValue
      break
    case 'allowfullscreen':
    case 'autoplay':
    case 'capture':
    case 'checked':
    case 'controls':
    case 'default':
    case 'disabled':
    case 'hidden':
    case 'indeterminate':
    case 'loop':
    case 'muted':
    case 'novalidate':
    case 'open':
    case 'readOnly':
    case 'required':
    case 'reversed':
    case 'scoped':
    case 'seamless':
    case 'selected':
      element[propName] = !!propValue
      break
    case 'defaultChecked':
    case 'value':
    case 'volume':
    case 'id': {
      const value = isNullOrUndef(propValue) ? '' : propValue
      if (element[propName] !== value) {
        element[propName] = value
      }
      break
    }
    default:
      if (isNullOrUndef(propValue)) {
        element.removeAttribute(propName)
      } else if (isBoolean(propValue)) {
        if (propValue) {
          element.setAttribute(propName, propName)
        } else {
          element.removeAttribute(propName)
        }
      } else {
        element.setAttribute(propName, propValue + '')
      }
  }
}

export function connectObservableDOMProp(
  propName: RvdDOMPropName,
  rvdElement: RvdElementNode
): void {
  let prev: RvdDOMProp
  rvdElement.sub.add(
    (rvdElement.props[propName] as RvdObservableDOMProp).subscribe(
      observer(v => v !== prev && connectDOMProp(propName, (prev = v), rvdElement.dom))
    )
  )
}
