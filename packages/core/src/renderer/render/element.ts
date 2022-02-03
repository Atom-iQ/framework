import type { RvdElementNode, RvdParent, RvdGroupNode } from 'types'
import { RvdListType } from 'shared/flags'

import { renderDomChild, isRvdDomNode, removeExistingGroup, unsubscribe } from '../utils'

export function renderDomElement(node: RvdElementNode, parent: RvdParent): void {
  const existingNode = parent.children[node.index]
  if (existingNode && parent.type !== RvdListType.Keyed) {
    if (isRvdDomNode(existingNode)) {
      return replaceElementForElement(existingNode as RvdElementNode, node, parent)
    }

    removeExistingGroup(existingNode as RvdParent<RvdGroupNode>, parent)
    unsubscribe(existingNode)
  }
  renderNewElement(node, parent)
}

function replaceElementForElement(
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

function renderNewElement(node: RvdElementNode, parent: RvdParent): void {
  // Add child subscription to parent subscription
  parent.sub.add(node.sub)
  // Render DOM element
  renderDomChild(node, parent)

  if (parent.type !== RvdListType.Keyed) {
    // Add element node to parent rvd (children)
    parent.children[node.index] = node
  }
}
