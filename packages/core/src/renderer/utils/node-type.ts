import { isObservable } from '@atom-iq/rx';

import type {
  InputHTMLAttributes,
  RvdChild,
  RvdComponentNode,
  RvdControlledFormElement,
  RvdDomNode,
  RvdElementNode,
  RvdFragmentNode,
  RvdHTMLProps,
  RvdKeyedListNode,
  RvdListNode,
  RvdNode,
  RvdNonKeyedListNode
} from 'types';
import { RvdListType, RvdNodeFlags } from 'shared/flags';

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

export function isRvdElement(node: RvdNode): node is RvdElementNode {
  return !!(RvdNodeFlags.Element & node.flag)
}

export function isRvdFragment(node: RvdNode): node is RvdFragmentNode {
  return node.flag === RvdNodeFlags.Fragment
}

export function isRvdComponent(node: RvdNode): node is RvdComponentNode {
  return node.flag === RvdNodeFlags.Component
}

export function isRvdList(node: RvdNode): node is RvdListNode {
  return node.flag === RvdNodeFlags.List
}

export function isRvdNonKeyedList(node: RvdNode): node is RvdNonKeyedListNode {
  return node.type === RvdListType.NonKeyed
}

export function isRvdKeyedList(node: RvdNode): node is RvdKeyedListNode {
  return node.type === RvdListType.Keyed
}

export function isControlledFormElement(
  rvdElement: RvdElementNode
): rvdElement is RvdControlledFormElement {
  const { type, value, checked } = rvdElement.props as RvdHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
  const flag = rvdElement.flag

  if (flag === RvdNodeFlags.Input) {
    return isObservable(type)
      ? isObservable(value) || isObservable(checked)
      : type && isCheckedType(type as string)
      ? isObservable(checked)
      : isObservable(value)
  }

  if (flag === RvdNodeFlags.Textarea || flag === RvdNodeFlags.Select) {
    return isObservable(value)
  }
  return false
}

export const isCheckedType = (type: string): boolean => type === 'checkbox' || type === 'radio'
