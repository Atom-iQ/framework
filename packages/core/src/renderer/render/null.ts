import type { RvdGroupNode, RvdNode } from 'types';

import { isRvdDomNode, removeExistingGroup, unsubscribe } from '../utils'

/**
 * @param index
 * @param parent
 */
export function renderNull(index: number, parent: RvdNode): void {
  const existingNode = parent.live[index]
  if (existingNode) {
    if (isRvdDomNode(existingNode)) {
      parent.dom.removeChild(existingNode.dom)
    } else {
      removeExistingGroup(existingNode as RvdGroupNode, parent)
    }
    unsubscribe(existingNode)
  }
  parent.live[index] = undefined
}
