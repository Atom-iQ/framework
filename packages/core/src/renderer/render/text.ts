import type { RvdContext, RvdGroupNode, RvdNode } from 'types'
import { RvdNodeFlags } from 'shared/flags'

import {
  createRvdTextNode,
  removeExistingGroup,
  unsubscribe,
  findDomElement,
  renderDomChild,
  isRvdElement
} from '../utils';

export function renderText(
  index: number,
  text: string | number,
  parent: RvdNode,
  context: RvdContext
): void {
  // 1. Apply middleware - if it returns false, stop rendering
  const middleware = context.$.text

  if (middleware) {
    text = middleware(text, parent, context) as string
    if ((text as unknown) as boolean === false) return
  }

  const existingNode = parent.live[index]

  if (existingNode) {
    if (existingNode.flag === RvdNodeFlags.Text) {
      existingNode.dom.nodeValue = text + ''
      return
    } else if (isRvdElement(existingNode)) {
      // If existing child is element, replace it with new text node
      const textNode = createRvdTextNode(index, text)
      parent.dom.replaceChild(textNode.dom, existingNode.dom)
      unsubscribe(existingNode)
      parent.live[index] = textNode
      return
    }
    // If existing child is fragment or component, remove it and render text node
    removeExistingGroup(existingNode as RvdGroupNode, parent)
    unsubscribe(existingNode)
  }
  const textNode = createRvdTextNode(index, text)
  renderDomChild(textNode, parent)
  parent.live[index] = textNode
}

export function hydrateText(
  index: number,
  text: string | number,
  parent: RvdNode,
  context: RvdContext
): void {
  // 1. Apply middleware - if it returns false, stop rendering
  const middleware = context.$.text

  if (middleware) {
    text = middleware(text, parent, context) as string | number
    if ((text as unknown) as boolean === false) return
  }

  const dom = findDomElement<Text>(parent, index)

  dom.nodeValue !== text && (dom.nodeValue = text + '')

  parent.live[index] = {
    flag: RvdNodeFlags.Text,
    index,
    dom
  }
}
