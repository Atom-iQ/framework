import { asyncScheduler, Subscription } from '@atom-iq/rx'

import type { RvdGroupNode, RvdListDataType, RvdNonKeyedListNode, RvdParent } from 'types'

import { isRvdDomNode, removeExistingGroup, unsubscribeAsync } from '../utils'

export function removeNonKeyedListChildren<T extends RvdListDataType = unknown>(
  newLength: number,
  oldLength: number,
  rvdList: RvdNonKeyedListNode<T>
): void {
  const toUnsubscribe: Subscription[] = []
  for (let i = oldLength - 1; i >= newLength; --i) {
    const existingNode = rvdList.children[i]
    if (existingNode) {
      if (isRvdDomNode(existingNode)) {
        rvdList.dom.removeChild(existingNode.dom)
        rvdList.children[i] = undefined
      } else {
        removeExistingGroup(existingNode as RvdParent<RvdGroupNode>, rvdList)
      }
      toUnsubscribe.push(existingNode.sub)
    }
  }

  rvdList.children.length = newLength
  asyncScheduler.schedule(unsubscribeAsync, 0, toUnsubscribe)
}
