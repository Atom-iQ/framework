import { ConnectPropCallback, RvdChild, RvdDOMProp, RxO, RxSub } from '../../../shared/types'
import { isBoolean, isNullOrUndef } from '../../../shared'

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

type ObservableProp = RxO<Exclude<RvdDOMProp, RvdChild[]>>

export const connectObservableDOMProp = (
  element: Element,
  propsSubscription: RxSub
): ConnectPropCallback<ObservableProp> => (propName, observableProp) => {
  propsSubscription.add(
    observableProp.subscribe(propValue => {
      connectDOMProp(element)(propName, propValue)
    })
  )
}
