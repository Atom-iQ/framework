import type { RvdParent } from 'types'

import { getPreviousSibling } from '../dom-renderer'

export function removeExcessiveDomInHydrate(
  rvdElement: RvdParent,
  isSingleObservableOrTextChild: boolean,
  dom: HTMLElement | SVGElement
): void {
  // Get element last rendered child from rvd
  const lastChild =
    getPreviousSibling(rvdElement, rvdElement.children.length) ||
    // If element has single observable child and it's a string
    // it could not use RVD abstraction. In that case, get last child
    // element from DOM first child
    getLastChildFromSingleTextNode(rvdElement, isSingleObservableOrTextChild, dom)

  if (lastChild) {
    // Remove elements rendered on SSR, that shouldn't be in app
    while (lastChild.nextSibling) dom.removeChild(lastChild.nextSibling)
  } else if (dom.firstChild) {
    // If element has no lastChild from rvd or single string node,
    // but has DOM children - clear children
    dom.textContent = ''
  }
}

export function hydrateSingleStaticTextChild(textChild: string, dom: Element): void {
  const renderedChild = dom.firstChild
  if (renderedChild) {
    // If DOM rendered on SSR has different value than text child, set new value
    renderedChild.nodeValue !== textChild && (renderedChild.nodeValue = textChild)
  } else {
    // If there's no DOM rendered on SSR, set new text content
    dom.textContent = textChild
  }
}

const getLastChildFromSingleTextNode = (
  rvdElement: RvdParent,
  isSingleObservableOrTextChild: boolean,
  dom: HTMLElement | SVGElement
): Text | false =>
  isSingleObservableOrTextChild &&
  !rvdElement.children[0] &&
  dom.firstChild &&
  dom.firstChild.nodeType === Node.TEXT_NODE &&
  (dom.firstChild as Text)
