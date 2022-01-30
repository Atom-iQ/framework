import type { RvdChild, RvdFragmentNode, RvdListNode, RvdGroupNode, RvdParent } from 'types'
import { RvdNodeFlags } from 'shared/flags'

import { isRvdDomNode } from './node-type'

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
  if (isRvdDomNode(lastRvdChild)) {
    rvdList.nextSibling = lastRvdChild.dom.nextSibling as Element | Text | null
  } else {
    setListNextSiblingFromLastChild(lastRvdChild as RvdParent, rvdList)
  }
}
