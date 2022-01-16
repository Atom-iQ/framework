import type { RvdChild, RvdFragmentNode, RvdListNode, RvdGroupNode, RvdParent } from 'types'
import { RvdListType, RvdNodeFlags } from 'shared/flags'

import { unsubscribe } from './observable'

export const childrenArrayToFragment = (children: RvdChild[], index: number): RvdFragmentNode => ({
  flag: RvdNodeFlags.Fragment,
  index,
  children
})

export function removeExistingGroup(
  existingGroup: RvdParent<RvdGroupNode>,
  parent: RvdParent
): void {
  for (let i = 0; i < existingGroup.children.length; ++i) {
    const child = existingGroup.children[i]
    if (child) {
      if (RvdNodeFlags.DomNode & child.flag) {
        parent.dom.removeChild(child.dom)
      } else {
        removeExistingGroup(child as RvdParent<RvdGroupNode>, existingGroup)
      }
    }
  }
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

export function setListNextSibling(rvdList: RvdListNode, parent: RvdParent): void {
  if (rvdList.children.length === 0) {
    const previousSibling = rvdList.previousSibling
    if (previousSibling) {
      rvdList.nextSibling = previousSibling.nextSibling as Element | Text | null
    } else {
      rvdList.nextSibling = parent.dom.firstChild as Element | Text | null
    }
  } else {
    setListNextSiblingFromLastChild(rvdList as RvdParent, rvdList)
  }
}

function setListNextSiblingFromLastChild(group: RvdParent, rvdList: RvdListNode): void {
  const lastRvdChild = group.children[group.children.length - 1]
  if (RvdNodeFlags.DomNode & lastRvdChild.flag) {
    rvdList.nextSibling = lastRvdChild.dom.nextSibling as Element | Text | null
  } else {
    setListNextSiblingFromLastChild(lastRvdChild as RvdParent, rvdList)
  }
}
