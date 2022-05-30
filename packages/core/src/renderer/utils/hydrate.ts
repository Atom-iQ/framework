import type { RvdNode } from 'types'

import { getPreviousSibling } from './node'

export function removeExcessiveDomInHydrate(
  rvdElement: RvdNode,
  isSingleChild: boolean,
  dom: HTMLElement | SVGElement
): void {
  // Get element last rendered child from rvd
  // If element has single string or observable string child,
  // it may not use RVD abstraction. In that case, get last child
  // element from DOM first child
  const lastChild =
    getPreviousSibling(rvdElement, rvdElement.live.length) ||
    getSingleTextChild(rvdElement, isSingleChild, dom)

  if (lastChild) {
    // Remove elements rendered on SSR, that shouldn't be in app
    while (lastChild.nextSibling) dom.removeChild(lastChild.nextSibling)
  } else if (dom.firstChild) {
    // If element has no lastChild from rvd or single string node,
    // but has DOM children - clear children
    dom.textContent = ''
  }
}

export function hydrateSingleTextChild(textChild: string, dom: Element): void {
  const renderedChild = dom.firstChild
  if (renderedChild) {
    // If DOM rendered on SSR has different value than text child, set new value
    renderedChild.nodeValue !== textChild && (renderedChild.nodeValue = textChild)
  } else {
    // If there's no DOM rendered on SSR, set new text content
    dom.textContent = textChild
  }
}

const getSingleTextChild = (
  rvdElement: RvdNode,
  isSingleChild: boolean,
  dom: HTMLElement | SVGElement
): Text | false =>
  isSingleChild &&
  !rvdElement.live[0] &&
  dom.firstChild &&
  dom.firstChild.nodeType === Node.TEXT_NODE &&
  (dom.firstChild as Text)
