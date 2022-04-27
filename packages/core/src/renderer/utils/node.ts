import { groupSub } from '@atom-iq/rx'

import type {
  RvdGroupNode,
  RvdTextNode,
  RvdElementNode,
  RvdElementNodeType,
  RvdNode
} from 'types';
import { RvdNodeFlags } from 'shared/flags'

import { unsubscribe } from './observable'
import { removeExistingGroup } from './group'
import { isRvdDomNode, isRvdKeyedList, isRvdList } from './node-type';

/**
 * Render DOM Child
 *
 * Render (append or insertBefore) DOM Element or Text, on its correct index position.
 *
 * If rendering list elements and list is in append mode, insert before next sibling
 * of whole list, if exists. If not exists, just append child.
 *
 * In standard rendering mode, find previous sibling, check if it has next sibling and
 * insert before it, or just append child
 * @param child
 * @param parent
 */
export function renderDomChild(child: RvdElementNode | RvdTextNode, parent: RvdNode): void {
  if (isRvdList(parent) && parent.append) {
    // List append mode rendering
    // When list is in append mode, we are sure that all elements are added at the end
    // of the list. In that case, we are saving next DOM sibling of the list node (or null,
    // when list hasn't next sibling), on every list re-render. Thanks to this, we don't
    // have to look for next sibling of every single list element
    if (parent.nextSibling) {
      // If list has next sibling, insert before it, for all list children
      parent.dom.insertBefore(child.dom, parent.nextSibling)
    } else {
      // If list has not next sibling, append for all list children
      parent.dom.appendChild(child.dom)
    }
  } else {
    // Normal rendering
    // To know the exact position, where new child should be inserted, we are looking for
    // the reference to previous sibling in parent live children
    const previousSibling = getPreviousSibling(parent, child.index)
    if (!previousSibling && parent.dom.firstChild) {
      // If it hasn't previous sibling, but parent has children, insert before first child
      parent.dom.insertBefore(child.dom, parent.dom.firstChild)
    } else if (previousSibling && previousSibling.nextSibling) {
      // If it has previous and next sibling, insert before next sibling
      parent.dom.insertBefore(child.dom, previousSibling.nextSibling)
    } else {
      // If it has not next sibling, append
      parent.dom.appendChild(child.dom)
    }
  }
}

/**
 * Find DOM Element
 *
 * Get DOM Element for currently hydrated RVD Element Node
 * @param parent
 * @param index
 */
export function findDomElement<T extends HTMLElement | SVGElement | Text>(
  parent: RvdNode,
  index: number
): T | null {
  const previousSibling = getPreviousSibling(parent, index)
  if (previousSibling) return previousSibling.nextSibling as T | null
  return parent.dom.firstChild as T | null
}

/**
 * Create DOM Element
 *
 * Create new HTML or SVG Element
 * @param tag
 * @param isSVG
 */
export function createDomElement(tag: RvdElementNodeType, isSVG = false): HTMLElement | SVGElement {
  if (isSVG) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag)
  }

  return document.createElement(tag)
}

/**
 * Create DOM Text Node
 *
 * Create new Text Node from given string or number
 * @param stringOrNumber
 */
export function createDomTextNode(stringOrNumber: string | number): Text {
  return document.createTextNode(stringOrNumber + '')
}

export function createRvdTextNode(index: number, text: string | number): RvdTextNode {
  return {
    flag: RvdNodeFlags.Text,
    index,
    dom: createDomTextNode(text)
  }
}

export function initRvdGroupNode<RvdNodeType extends RvdGroupNode>(
  group: RvdNodeType,
  parent: RvdNode
): RvdNodeType {
  parent.sub.add((group.sub = groupSub()))
  group.dom = parent.dom as Element
  if (!isRvdKeyedList(parent)) {
    parent.live[group.index] = group
  }
  return Object.defineProperty(group, 'previousSibling', {
    enumerable: true,
    get() {
      return getPreviousSibling(parent, group.index)
    }
  })
}

/**
 * Get previous sibling
 *
 * Get previous sibling from parent RVD, closest to the given index position. Try to find previous
 * sibling recursively, no matter how deep is structure - check virtual node group children, up to
 * parent DOM element node level. When there is no previous sibling, return null
 * @param parent
 * @param index
 */
export function getPreviousSibling(parent: RvdNode, index: number): Element | Text | null {
  while (index--) {
    const child = parent.live[index]
    if (child) {
      return isRvdDomNode(child) ? child.dom : getPreviousSibling(child, child.live.length)
    }
  }
  return (parent as RvdGroupNode).previousSibling
}

export function removeExistingNode(index: number, parent: RvdNode): void {
  if (!isRvdKeyedList(parent)) {
    const existingNode = parent.live[index]
    if (existingNode) {
      if (isRvdDomNode(existingNode)) {
        parent.dom.removeChild(existingNode.dom)
        parent.live[existingNode.index] = undefined
      } else {
        // remove created component
        removeExistingGroup(existingNode as RvdGroupNode, parent)
      }
      unsubscribe(existingNode)
    }
  }
}
