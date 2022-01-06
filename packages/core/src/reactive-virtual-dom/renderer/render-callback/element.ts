import type { RvdElementNode, RvdNode } from 'types'
import { RvdFragmentNode } from 'types'
import { renderChildInIndexPosition } from '../dom-renderer'
import { removeExistingGroup, unsubscribe } from '../utils'
import { RvdListType, RvdNodeFlags } from 'shared/flags'

export function elementRenderCallback(child: RvdElementNode, parentRvdNode: RvdNode): void {
  const existingChild = parentRvdNode.rvd[child.index]
  if (existingChild && parentRvdNode.type !== RvdListType.Keyed) {
    if (RvdNodeFlags.ElementOrText & existingChild.flag) {
      return replaceElementForElement(existingChild as RvdElementNode, child, parentRvdNode)
    }

    removeExistingGroup(existingChild as RvdFragmentNode, parentRvdNode)
    unsubscribe(existingChild)
  }
  renderElement(child, parentRvdNode)
}

export function replaceElementForElement(
  existingChild: RvdElementNode,
  childRvdNode: RvdElementNode,
  parentRvdNode: RvdNode
): void {
  // Add child subscription to parent subscription
  parentRvdNode.sub.add(childRvdNode.sub)
  // Replace DOM element
  parentRvdNode.dom.replaceChild(childRvdNode.dom, existingChild.dom)
  // Unsubscribe replaced element
  unsubscribe(existingChild)
  // Set created child data in parent manager
  parentRvdNode.rvd[childRvdNode.index] = childRvdNode
}

export function renderElement(childRvdNode: RvdElementNode, parentRvdNode: RvdNode): void {
  // Add child subscription to parent subscription
  parentRvdNode.sub.add(childRvdNode.sub)
  // Render DOM element
  renderChildInIndexPosition(childRvdNode, parentRvdNode)
  // Set created child data in parent manager
  if (parentRvdNode.type !== RvdListType.Keyed) {
    parentRvdNode.rvd[childRvdNode.index] = childRvdNode
  }
}
