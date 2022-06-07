import type { RvdChild, RvdFragmentNode, RvdListNode, RvdGroupNode, RvdNode } from 'types';
import { RvdNodeFlags } from 'shared/flags'

import { isRvdDomNode } from './node-type'

export function childrenArrayToFragment(children: RvdChild[], index: number): RvdFragmentNode {
  return {
    flag: RvdNodeFlags.Fragment,
    index,
    children
  }
}

export function removeExistingGroup(
  group: RvdGroupNode,
  parent: RvdNode
): void {
  for (const child of group.live) {
    if (child) {
      if (isRvdDomNode(child)) {
        parent.dom.removeChild(child.dom)
      } else {
        removeExistingGroup(child as RvdGroupNode, group)
      }
    }
  }
}

export function setListNextSibling(rvdList: RvdListNode, parent: RvdNode): void {
  if (rvdList.live.length === 0) {
    const previousSibling = rvdList.previousSibling
    if (previousSibling) {
      rvdList.nextSibling = previousSibling.nextSibling as Element | Text | null
    } else {
      rvdList.nextSibling = parent.dom.firstChild as Element | Text | null
    }
  } else {
    setListNextSiblingFromLastChild(rvdList as RvdNode, rvdList)
  }
}

function setListNextSiblingFromLastChild(group: RvdNode, rvdList: RvdListNode): void {
  const lastRvdChild = group.live[group.live.length - 1]
  if (isRvdDomNode(lastRvdChild)) {
    rvdList.nextSibling = lastRvdChild.dom.nextSibling as Element | Text | null
  } else {
    setListNextSiblingFromLastChild(lastRvdChild, rvdList)
  }
}
