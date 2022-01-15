import type { RvdChild, RvdComponentNode, RvdFragmentNode, RvdListNode, RvdNode } from 'types'

import { RvdNodeFlags } from 'shared/flags'
import { unsubscribe } from './observable'
import { RvdGroupNode } from 'types'

export const childrenArrayToFragment = (children: RvdChild[], index: number): RvdFragmentNode => ({
  flag: RvdNodeFlags.Fragment,
  index,
  children
})

export function removeExistingGroup(
  existingGroup: RvdFragmentNode | RvdComponentNode | RvdListNode,
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

export function setListNextSibling(rvdList: RvdListNode, parentRvdNode: RvdNode): void {
  if (rvdList.rvd.length === 0) {
    const previousSibling = rvdList.previousSibling
    if (previousSibling) {
      rvdList.nextSibling = previousSibling.nextSibling
        ? (previousSibling.nextSibling as Element | Text)
        : null
    } else {
      rvdList.nextSibling = parentRvdNode.dom.firstChild
        ? (parentRvdNode.dom.firstChild as Element | Text)
        : null
    }
  } else {
    setListNextSiblingFromLastChild(rvdList as RvdGroupNode, rvdList)
  }
}

function setListNextSiblingFromLastChild(group: RvdGroupNode, rvdList: RvdListNode): void {
  const lastRvdChild = group.rvd[group.rvd.length - 1]
  if (RvdNodeFlags.ElementOrText & lastRvdChild.flag) {
    rvdList.nextSibling = lastRvdChild.dom.nextSibling
      ? (lastRvdChild.dom.nextSibling as Element | Text)
      : null
  } else {
    setListNextSiblingFromLastChild(lastRvdChild as RvdGroupNode, rvdList)
  }
}
