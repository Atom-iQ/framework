import type { RvdGroupNode, RvdParent } from 'types'

import { isRvdDomNode, removeExistingGroup, unsubscribe } from '../utils'

/**
 * @param index
 * @param parent
 */
export function renderNull(index: number, parent: RvdParent): void {
  const existingNode = parent.children[index]
  if (existingNode) {
    if (isRvdDomNode(existingNode)) {
      parent.dom.removeChild(existingNode.dom)
    } else {
      removeExistingGroup(existingNode as RvdParent<RvdGroupNode>, parent)
    }
    unsubscribe(existingNode)
  }
  parent.children[index] = undefined
}
