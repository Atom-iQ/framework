import type { RvdContext, RvdGroupNode, RvdParent } from 'types'
import { RvdNodeFlags } from 'shared/flags'
import { applyMiddlewares } from 'middlewares/middlewares-manager'

import { createRvdTextNode, removeExistingGroup, unsubscribe } from '../utils'
import { renderDomChild } from '../dom-renderer'

export function renderText(
  child: string | number,
  index: number,
  parent: RvdParent,
  context: RvdContext
): void {
  child = applyMiddlewares('textPreRender', context, child, index, parent, context)

  const existingNode = parent.children[index]

  if (existingNode) {
    if (existingNode.flag === RvdNodeFlags.Text) {
      existingNode.dom.nodeValue = child + ''
      return
    } else if (RvdNodeFlags.Element & existingNode.flag) {
      // If existing child is element, replace it with new text node
      const textNode = createRvdTextNode(index, child)
      parent.dom.replaceChild(textNode.dom, existingNode.dom)
      unsubscribe(existingNode)
      parent.children[index] = textNode
      return
    }
    // If existing child is fragment or component, remove it and render text node
    removeExistingGroup(existingNode as RvdParent<RvdGroupNode>, parent)
    unsubscribe(existingNode)
  }
  const textNode = createRvdTextNode(index, child)
  renderDomChild(textNode, parent)
  parent.children[index] = textNode
}
