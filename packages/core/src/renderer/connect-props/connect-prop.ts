import { isObservable } from '@atom-iq/rx'

import type { RvdContext, RvdDOMEventHandlerName, RvdDOMPropName, RvdElementNode } from 'types'
import { handleRedEvent } from 'events/event-delegation'

import { connectStyleProp } from './style'
import { connectDOMProp, connectObservableDOMProp } from './dom-prop'

export function connectProp(
  propName: string,
  rvdElement: RvdElementNode,
  context: RvdContext
): void {
  if (propName === 'style') {
    return connectStyleProp(rvdElement)
  }

  const propValue = rvdElement.props[propName]
  if (isEventHandler(propName)) {
    if (!propValue) return

    return handleRedEvent(propName, rvdElement, context)
  }
  if (isObservable(propValue)) {
    return connectObservableDOMProp(propName as RvdDOMPropName, rvdElement)
  }

  return connectDOMProp(propName, propValue, rvdElement.dom)
}

function isEventHandler(propName: string): propName is RvdDOMEventHandlerName {
  return propName.charCodeAt(0) === 111 && propName.charCodeAt(1) === 110
}
