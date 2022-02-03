import type { RvdContext, RvdGroupNode, RvdParent } from 'types'
import { RvdNodeFlags } from 'shared/flags'

import {
  createRvdTextNode,
  removeExistingGroup,
  unsubscribe,
  findDomElement,
  renderDomChild
} from '../utils'

export function renderText(
  text: string | number,
  index: number,
  parent: RvdParent,
  context: RvdContext
): void {
  // 1. Apply middleware - if it returns false, stop rendering
  const middleware = context.$.text

  if (middleware) {
    text = middleware(text, context, parent) as string
    if ((text as unknown as boolean) === false) return
  }

  const existingNode = parent.children[index]

  if (existingNode) {
    if (existingNode.flag === RvdNodeFlags.Text) {
      existingNode.dom.nodeValue = text + ''
      return
    } else if (RvdNodeFlags.Element & existingNode.flag) {
      // If existing child is element, replace it with new text node
      const textNode = createRvdTextNode(index, text)
      parent.dom.replaceChild(textNode.dom, existingNode.dom)
      unsubscribe(existingNode)
      parent.children[index] = textNode
      return
    }
    // If existing child is fragment or component, remove it and render text node
    removeExistingGroup(existingNode as RvdParent<RvdGroupNode>, parent)
    unsubscribe(existingNode)
  }
  const textNode = createRvdTextNode(index, text)
  renderDomChild(textNode, parent)
  parent.children[index] = textNode
}

export function hydrateText(
  text: string | number,
  index: number,
  parent: RvdParent,
  context: RvdContext
): void {
  // 1. Apply middleware - if it returns false, stop rendering
  const middleware = context.$.text

  if (middleware) {
    text = middleware(text, context, parent) as string | number
    if ((text as unknown as boolean) === false) return
  }

  const dom = findDomElement<Text>(parent, index)

  dom.nodeValue !== text && (dom.nodeValue = text + '')

  parent.children[index] = {
    flag: RvdNodeFlags.Text,
    index,
    dom
  }
}
