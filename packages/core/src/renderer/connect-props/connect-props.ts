import type { RvdDOMPropName, RvdElementNode, RvdContext } from 'types'
import { RvdNodeFlags } from 'shared/flags'

import { isControlledFormElement } from '../utils'

import { connectControlledElement } from './controlled-elements/controlled-element'
import { connectProp } from './connect-prop'

/**
 * Connecting element props - just set static props and subscribe to observable props
 * @param rvdElement
 * @param context
 */
export function connectElementProps(rvdElement: RvdElementNode, context: RvdContext): void {
  if ((RvdNodeFlags.FormElement & rvdElement.flag) !== 0 && isControlledFormElement(rvdElement)) {
    connectControlledElement(rvdElement, context)
  } else {
    for (const propName in rvdElement.props) {
      // noinspection JSUnfilteredForInLoop
      connectProp(propName as RvdDOMPropName, rvdElement, context)
    }
  }
}
