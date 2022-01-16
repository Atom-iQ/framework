import type { RvdGroupNode, RvdParent } from 'types'
import { RvdNodeFlags } from 'shared/flags'

import { removeExistingGroup, unsubscribe } from '../utils'

/**
 * @param index
 * @param parent
 */
export function nullRenderCallback(index: number, parent: RvdParent): void {
  const existingNode = parent.children[index]
  if (existingNode) {
    if (RvdNodeFlags.DomNode & existingNode.flag) {
      parent.dom.removeChild(existingNode.dom)
      unsubscribe(existingNode)
    } else {
      removeExistingGroup(existingNode as RvdParent<RvdGroupNode>, parent)
      unsubscribe(existingNode)
    }
  }
  parent.children[index] = undefined
}
