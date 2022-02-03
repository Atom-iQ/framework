import { groupSub } from '@atom-iq/rx'
import type {
  RvdGroupNode,
  RvdParent,
  RvdTextNode,
  RvdElementNode,
  RvdElementNodeType,
  RvdListNode
} from 'types'
import { RvdListType, RvdNodeFlags } from 'shared/flags'

import { unsubscribe } from './observable'
import { removeExistingGroup } from './group'
import { isRvdDomNode } from './node-type'

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
export function renderDomChild(child: RvdElementNode | RvdTextNode, parent: RvdParent): void {
  if (parent.flag === RvdNodeFlags.List && (parent as RvdListNode).append) {
    // List append mode rendering
    // When list is in append mode, we are sure that all elements are added at the end
    // of the list. In that case, we are saving next DOM sibling of the list node (or null,
    // when list hasn't next sibling), on every list re-render. Thanks to this, we don't
    // have to look for next sibling of every single list element
    if ((parent as RvdListNode).nextSibling) {
      // If list has next sibling, insert before it, for all list children
      parent.dom.insertBefore(child.dom, (parent as RvdListNode).nextSibling)
    } else {
      // If list has not next sibling, append for all list children
      parent.dom.appendChild(child.dom)
    }
  } else {
    // Normal rendering
    // To know the exact position, where new child should be inserted, we are looking for
    // reference to previous sibling in children manager
    const previousSibling = getPreviousSibling(parent, child.index)
    if (!previousSibling && parent.dom.firstChild) {
      // If hasn't previous sibling, but parent has children, insert before first child
      parent.dom.insertBefore(child.dom, parent.dom.firstChild)
    } else if (previousSibling && previousSibling.nextSibling) {
      // If has previous and next sibling, insert before next sibling
      parent.dom.insertBefore(child.dom, previousSibling.nextSibling)
    } else {
      // If has not next sibling, append
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
  parent: RvdParent,
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

export function initRvdGroupNode<RvdNodeType extends RvdGroupNode>(
  group: RvdNodeType,
  parent: RvdParent
): RvdNodeType {
  parent.sub.add((group.sub = groupSub()))
  group.dom = parent.dom as Element
  if (parent.type !== RvdListType.Keyed) {
    parent.children[group.index] = group
  }
  return Object.defineProperty(group, 'previousSibling', {
    enumerable: true,
    get() {
      return getPreviousSibling(parent, group.index)
    }
  })
}

export function createRvdTextNode(index: number, child: string | number): RvdTextNode {
  return {
    flag: RvdNodeFlags.Text,
    index,
    dom: createDomTextNode(child)
  }
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
export function getPreviousSibling(parent: RvdParent, index: number): Element | Text | null {
  while (index--) {
    if (parent.children[index]) {
      const child = parent.children[index] as RvdParent
      return isRvdDomNode(child) ? child.dom : getPreviousSibling(child, child.children.length)
    }
  }
  return (parent as RvdParent<RvdGroupNode>).previousSibling
}

export function removeExistingNode(index: number, parent: RvdParent): void {
  if (parent.type !== RvdListType.Keyed) {
    const existingNode = parent.children[index]
    if (existingNode) {
      if (RvdNodeFlags.DomNode & existingNode.flag) {
        parent.dom.removeChild(existingNode.dom)
        parent.children[existingNode.index] = undefined
      } else {
        // remove created component
        removeExistingGroup(existingNode as RvdParent<RvdGroupNode>, parent)
      }
      unsubscribe(existingNode)
    }
  }
}
