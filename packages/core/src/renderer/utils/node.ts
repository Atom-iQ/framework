import { SubscriptionGroup } from '@atom-iq/rx'
import type { RvdGroupNode, RvdParent, RvdTextNode } from 'types'
import { RvdListType, RvdNodeFlags } from 'shared/flags'

import { getPreviousSibling, createDomTextNode } from '../dom-renderer'

import { unsubscribe } from './observable'
import { removeExistingGroup } from './group'

export function initRvdGroupNode<RvdNodeType extends RvdGroupNode>(
  group: RvdNodeType,
  parent: RvdParent
): RvdNodeType {
  parent.sub.add((group.sub = new SubscriptionGroup()))
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
