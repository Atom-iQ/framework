import { RvdNode, RvdTextNode } from 'types'
import { Subscription } from 'rxjs'
import { getPreviousSibling } from '../dom-renderer'
import { RvdListType, RvdNodeFlags } from 'shared/flags'
import { createTextNode } from 'rvd/renderer/utils/dom'

export function initRvdNode<RvdNodeType extends RvdNode>(
  newRvdNode: RvdNodeType,
  parentRvdNode: RvdNode
): RvdNodeType {
  parentRvdNode.sub.add((newRvdNode.sub = new Subscription()))
  newRvdNode.rvd = []
  newRvdNode.dom = parentRvdNode.dom as Element
  if (parentRvdNode.type !== RvdListType.Keyed) {
    parentRvdNode.rvd[newRvdNode.index] = newRvdNode
  }
  return Object.defineProperty(newRvdNode, 'previousSibling', {
    enumerable: true,
    get() {
      return getPreviousSibling(parentRvdNode, newRvdNode.index)
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
