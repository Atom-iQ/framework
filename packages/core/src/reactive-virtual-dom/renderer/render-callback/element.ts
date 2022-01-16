import type { RvdElementNode, RvdParent, RvdGroupNode } from 'types'
import { RvdListType, RvdNodeFlags } from 'shared/flags'

import { renderDomChild } from '../dom-renderer'
import { removeExistingGroup, unsubscribe } from '../utils'

export function elementRenderCallback(node: RvdElementNode, parent: RvdParent): void {
  const existingNode = parent.children[node.index]
  if (existingNode && parent.type !== RvdListType.Keyed) {
    if (RvdNodeFlags.DomNode & existingNode.flag) {
      return replaceElementForElement(existingNode as RvdElementNode, node, parent)
    }

    removeExistingGroup(existingNode as RvdParent<RvdGroupNode>, parent)
    unsubscribe(existingNode)
  }
  renderElement(node, parent)
}

export function replaceElementForElement(
  existingNode: RvdElementNode,
  node: RvdElementNode,
  parent: RvdParent
): void {
  // Add child subscription to parent subscription
  parent.sub.add(node.sub)
  // Replace DOM element
  parent.dom.replaceChild(node.dom, existingNode.dom)
  // Unsubscribe replaced element
  unsubscribe(existingNode)
  // Set created child data in parent manager
  parent.children[node.index] = node
}

export function renderElement(node: RvdElementNode, parent: RvdParent): void {
  // Add child subscription to parent subscription
  parent.sub.add(node.sub)
  // Render DOM element
  renderDomChild(node, parent)
  // Set created child data in parent manager
  if (parent.type !== RvdListType.Keyed) {
    parent.children[node.index] = node
  }
}
