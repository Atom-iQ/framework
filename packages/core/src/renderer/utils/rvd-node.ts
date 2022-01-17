import { SubscriptionGroup } from '@atom-iq/rx'

import type { RvdGroupNode, RvdParent, RvdTextNode } from 'types'
import { RvdListType, RvdNodeFlags } from 'shared/flags'

import { getPreviousSibling } from '../dom-renderer'

import { createTextNode } from './dom'

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
    dom: createTextNode(child)
  }
}
