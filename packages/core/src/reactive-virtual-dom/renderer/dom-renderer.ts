import type { RvdElementNode, RvdNode, RvdTextNode, RvdFragmentNode, RvdListNode } from 'types'
import { RvdNodeFlags } from 'shared/flags'

export function renderDomChild(
  childRvdElement: RvdElementNode | RvdTextNode,
  parentRvdNode: RvdNode
): void {
  if (parentRvdNode.flag === RvdNodeFlags.List && (parentRvdNode as RvdListNode).append) {
    if ((parentRvdNode as RvdListNode).nextSibling) {
      // If list has next sibling, insert before it, for all list children
      parentRvdNode.dom.insertBefore(
        childRvdElement.dom,
        (parentRvdNode as RvdListNode).nextSibling
      )
    } else {
      // If list has not next sibling, append for all list children
      parentRvdNode.dom.appendChild(childRvdElement.dom)
    }
  } else {
    // Normal rendering
    // To know the exact position, where new child should be inserted, we are looking for
    // reference to previous sibling in children manager
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
}

export function setSvgClassName(element: SVGElement, className: string | null): void {
  if (className) {
    element.setAttribute('class', className)
  } else {
    element.removeAttribute('class')
  }
}

export function setHtmlClassName(element: HTMLElement, className: string | null): void {
  element.className = className
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
