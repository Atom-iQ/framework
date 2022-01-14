import type { RvdElementNode, RvdNode, RvdTextNode, RvdFragmentNode } from 'types'
import { RvdNodeFlags } from 'shared/flags'

export function renderDomChild(
  childRvdElement: RvdElementNode | RvdTextNode,
  parentRvdNode: RvdNode
): void {
  // Normal rendering
  // To know the exact position, where new child should be inserted, we are looking for
  // reference to previous sibling in children manager - only after finishing append mode
  const previousSibling = getPreviousSibling(parentRvdNode, childRvdElement.index)
  if (!previousSibling) {
    if (parentRvdNode.dom.firstChild) {
      // If hasn't previous sibling, but parent has children, insert before first child
      parentRvdNode.dom.insertBefore(childRvdElement.dom, parentRvdNode.dom.firstChild)
    } else {
      // If hasn't previous sibling and parent has not children, append
      parentRvdNode.dom.appendChild(childRvdElement.dom)
    }
  } else if (previousSibling.nextSibling) {
    // If has previous and next sibling, insert before next sibling
    parentRvdNode.dom.insertBefore(childRvdElement.dom, previousSibling.nextSibling)
  } else {
    // If has previous, but has not next sibling, append
    parentRvdNode.dom.appendChild(childRvdElement.dom)
  }
}

export function setClassName(
  isSvg: boolean,
  element: HTMLElement | SVGElement,
  className: string | null
): void {
  if (isSvg) {
    if (className) {
      element.setAttribute('class', className)
    } else {
      element.removeAttribute('class')
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;(element as HTMLElement).className = className
  }
}

export function getPreviousSibling(parentRvdNode: RvdNode, index: number): Element | Text {
  while (index--) {
    if (parentRvdNode.rvd[index]) {
      const child = parentRvdNode.rvd[index]
      return RvdNodeFlags.ElementOrText & child.flag
        ? child.dom
        : getPreviousSibling(child, child.rvd.length)
    }
  }
  return (parentRvdNode as RvdFragmentNode).previousSibling
}
