import type { RvdChild, RvdComponentNode, RvdFragmentNode, RvdListNode, RvdNode } from 'types'

import { RvdNodeFlags } from 'shared/flags'
import { unsubscribe } from './observable'

export const childrenArrayToFragment = (children: RvdChild[], index: number): RvdFragmentNode => ({
  flag: RvdNodeFlags.Fragment,
  index,
  children
})

export function removeExistingGroup(
  existingGroup: RvdFragmentNode | RvdComponentNode | RvdListNode<unknown>,
  parentRvdNode: RvdNode
): void {
  const children = existingGroup.rvd
  for (let i = 0; i < children.length; ++i) {
    const child = children[i]
    if (child) {
      if (RvdNodeFlags.ElementOrText & child.flag) {
        parentRvdNode.dom.removeChild(child.dom)
      } else {
        removeExistingGroup(child as RvdFragmentNode, existingGroup)
      }
    }
  }
}

export function removeExistingNode(existingNode: RvdNode, parentRvdNode: RvdNode): void {
  if (existingNode) {
    if (RvdNodeFlags.ElementOrText & existingNode.flag) {
      parentRvdNode.dom.removeChild(existingNode.dom)
      parentRvdNode.rvd[existingNode.index] = undefined
    } else {
      // remove created component
      removeExistingGroup(existingNode as RvdComponentNode, parentRvdNode)
    }
    unsubscribe(existingNode)
  }
}
