import type { RvdElementNode, RvdGroupNode, RvdNode } from 'types';

import { renderDomChild, isRvdDomNode, removeExistingGroup, unsubscribe, isRvdKeyedList } from '../utils';

export function renderDomElement(node: RvdElementNode, parent: RvdNode): void {
  const existingNode = parent.live[node.index]
  if (existingNode && !isRvdKeyedList(parent)) {
    if (isRvdDomNode(existingNode)) {
      return replaceElementForElement(existingNode as RvdElementNode, node, parent)
    }

    removeExistingGroup(existingNode as RvdGroupNode, parent)
    unsubscribe(existingNode)
  }
  renderNewElement(node, parent)
}

function replaceElementForElement(
  existingNode: RvdElementNode,
  node: RvdElementNode,
  parent: RvdNode
): void {
  // Add child subscription to parent subscription
  parent.sub.add(node.sub)
  // Replace DOM element
  parent.dom.replaceChild(node.dom, existingNode.dom)
  // Unsubscribe replaced element
  unsubscribe(existingNode)
  // Set created child data in parent manager
  parent.live[node.index] = node
}

function renderNewElement(node: RvdElementNode, parent: RvdNode): void {
  // Add child subscription to parent subscription
  parent.sub.add(node.sub)
  // Render DOM element
  renderDomChild(node, parent)

  if (!isRvdKeyedList(parent)) {
    // Add element node to parent rvd (children)
    parent.live[node.index] = node
  }
}
