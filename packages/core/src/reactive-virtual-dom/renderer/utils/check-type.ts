import type {
  InputHTMLAttributes,
  RvdChild,
  RvdControlledFormElement,
  RvdElementNode,
  RvdNode,
  RvdHTMLProps
} from '../../../shared/types'
import { isNullOrUndef } from '../../../shared'
// noinspection ES6PreferShortImport
import { RvdNodeFlags } from '../../../shared/flags'
import { isObservable } from 'rxjs'

/**
 * Check if given child is element (Component, Fragment, DOM Element)
 * @param rvdChild
 */
export function isRvdNode(rvdChild: RvdChild): rvdChild is RvdNode {
  return rvdChild && (rvdChild as RvdNode).flag !== void 0
}

/**
 * Check if given DOM Element is SVG Element
 * @param rvdElement
 */
export function isControlledFormElement(
  rvdElement: RvdElementNode
): rvdElement is RvdControlledFormElement {
  const props = rvdElement.props as RvdHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >

  if (rvdElement.flag === RvdNodeFlags.InputElement) {
    return isObservable(props.type)
      ? isObservable(props.value) || isObservable(props.checked)
      : props.type && isCheckedType(props.type as string)
      ? isObservable(props.checked)
      : isObservable(props.value)
  }

  if (rvdElement.flag === RvdNodeFlags.TextareaElement) {
    return isObservable(props.value)
  }

  if (rvdElement.flag === RvdNodeFlags.SelectElement) {
    return isObservable(props.value)
  }
}

export const isCheckedType = (type: string): boolean => type === 'checkbox' || type === 'radio'
