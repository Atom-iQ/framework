import { ConnectPropCallback, RvdChild, RvdDOMProp } from '../../../shared/types'
import { isBoolean, isNullOrUndef } from '../../../shared'
import type { Observable, Subscription } from 'rxjs'

export const connectDOMProp = (
  element: Element
): ConnectPropCallback<Exclude<RvdDOMProp, RvdChild[]>> => (propName, propValue) => {
  if (propName === 'id') {
    element.id = isNullOrUndef(propValue) ? '' : propValue + ''
  } else if (isNullOrUndef(propValue)) {
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

type ObservableProp = Observable<Exclude<RvdDOMProp, RvdChild[]>>

export const connectObservableDOMProp = (
  element: Element,
  propsSubscription: Subscription
): ConnectPropCallback<ObservableProp> => (propName, observableProp) => {
  propsSubscription.add(
    observableProp.subscribe(propValue => {
      connectDOMProp(element)(propName, propValue)
    })
  )
}
