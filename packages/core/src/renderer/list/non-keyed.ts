import { asyncScheduler, Subscription } from '@atom-iq/rx'

import type { RvdGroupNode, RvdListDataType, RvdNonKeyedListNode } from 'types'

import { isRvdDomNode, removeExistingGroup, unsubscribeAsync } from '../utils'

export function removeNonKeyedListChildren<T extends RvdListDataType = unknown>(
  newLength: number,
  oldLength: number,
  rvdList: RvdNonKeyedListNode<T>
): void {
  const toUnsubscribe: Subscription[] = []
  for (let i = oldLength - 1; i >= newLength; --i) {
    const existingNode = rvdList.live[i]
    if (existingNode) {
      if (isRvdDomNode(existingNode)) {
        rvdList.dom.removeChild(existingNode.dom)
        rvdList.live[i] = undefined
      } else {
        removeExistingGroup(existingNode as RvdGroupNode, rvdList)
      }
      if (rvdList.props.keepRemoved) {
        rvdList.removed[existingNode.index] = existingNode
      }

      if (!rvdList.props.keepSubscribed) toUnsubscribe.push(existingNode.sub)
    }
  }

  rvdList.live.length = newLength
  asyncScheduler.schedule(unsubscribeAsync, 0, toUnsubscribe)
}
