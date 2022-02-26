import { isObservable } from '@atom-iq/rx'
import type {
  InputHTMLAttributes,
  RvdChild,
  RvdControlledFormElement,
  RvdElementNode,
  RvdNode,
  RvdHTMLProps,
  RvdDomNode
} from 'types'
import { RvdNodeFlags } from 'shared/flags'

/**
 * Check if given child is element (Component, Fragment, DOM Element)
 * @param child
 */
export function isRvdNode(child: RvdChild): child is RvdNode {
  return child && (child as RvdNode).flag !== void 0
}

/**
 * Check if given node is rvd dom node (element or text)
 * @param node
 */
export function isRvdDomNode(node: RvdNode): node is RvdDomNode {
  return (RvdNodeFlags.DomNode & node.flag) !== 0
}

export function isControlledFormElement(
  rvdElement: RvdElementNode
): rvdElement is RvdControlledFormElement {
  const props = rvdElement.props as RvdHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >

  if (rvdElement.flag === RvdNodeFlags.Input) {
    return isObservable(props.type)
      ? isObservable(props.value) || isObservable(props.checked)
      : props.type && isCheckedType(props.type as string)
      ? isObservable(props.checked)
      : isObservable(props.value)
  }

  if (rvdElement.flag === RvdNodeFlags.Textarea) {
    return isObservable(props.value)
  }

  if (rvdElement.flag === RvdNodeFlags.Select) {
    return isObservable(props.value)
  }
}

export const isCheckedType = (type: string): boolean => type === 'checkbox' || type === 'radio'