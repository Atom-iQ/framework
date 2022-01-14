import type { RvdContext, RvdFragmentNode, RvdNode } from 'types'
import { createRvdTextNode, removeExistingGroup, unsubscribe } from '../utils'
import { renderDomChild } from '../dom-renderer'
import { applyMiddlewares } from 'middlewares/middlewares-manager'
import { RvdNodeFlags } from 'shared/flags'

export function textRenderCallback(
  child: string | number,
  childIndex: number,
  parentRvdNode: RvdNode,
  context: RvdContext
): void {
  // Middleware: text pre-render - (child, parentElement, createdChildren, childIndex, context) => child
  child = applyMiddlewares('textPreRender', context, child, childIndex, parentRvdNode, context)

  const existingChild = parentRvdNode.rvd[childIndex]

  if (existingChild) {
    if (existingChild.flag === RvdNodeFlags.Text) {
      existingChild.dom.nodeValue = child + ''
      return
    } else if (RvdNodeFlags.Element & existingChild.flag) {
      // If existing child is element, replace it with new text node
      const textNode = createRvdTextNode(childIndex, child)
      parentRvdNode.dom.replaceChild(textNode.dom, existingChild.dom)
      unsubscribe(existingChild)
      parentRvdNode.rvd[childIndex] = textNode
      return
    }
    // If existing child is fragment or component, remove it and render text node
    removeExistingGroup(existingChild as RvdFragmentNode, parentRvdNode)
    unsubscribe(existingChild)
  }
  const textNode = createRvdTextNode(childIndex, child)
  renderDomChild(textNode, parentRvdNode)
  parentRvdNode.rvd[childIndex] = textNode
}
