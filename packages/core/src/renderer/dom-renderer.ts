import type { RvdElementNode, RvdTextNode, RvdListNode, RvdParent, RvdGroupNode } from 'types'
import { RvdNodeFlags } from 'shared/flags'

export function renderDomChild(child: RvdElementNode | RvdTextNode, parent: RvdParent): void {
  if (parent.flag === RvdNodeFlags.List && (parent as RvdListNode).append) {
    // List append mode rendering
    // When list is in append mode, we are sure that all elements are added at the end
    // of the list. In that case, we are saving next DOM sibling of the list node (or null,
    // when list hasn't next sibling), on every list re-render. Thanks to this, we don't
    // have to look for next sibling of every single list element
    if ((parent as RvdListNode).nextSibling) {
      // If list has next sibling, insert before it, for all list children
      parent.dom.insertBefore(child.dom, (parent as RvdListNode).nextSibling)
    } else {
      // If list has not next sibling, append for all list children
      parent.dom.appendChild(child.dom)
    }
  } else {
    // Normal rendering
    // To know the exact position, where new child should be inserted, we are looking for
    // reference to previous sibling in children manager
    const previousSibling = getPreviousSibling(parent, child.index)
    if (!previousSibling && parent.dom.firstChild) {
      // If hasn't previous sibling, but parent has children, insert before first child
      parent.dom.insertBefore(child.dom, parent.dom.firstChild)
    } else if (previousSibling && previousSibling.nextSibling) {
      // If has previous and next sibling, insert before next sibling
      parent.dom.insertBefore(child.dom, previousSibling.nextSibling)
    } else {
      // If has not next sibling, append
      parent.dom.appendChild(child.dom)
    }
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

export function getPreviousSibling(parent: RvdParent, index: number): Element | Text {
  while (index--) {
    if (parent.children[index]) {
      const child = parent.children[index] as RvdParent
      return RvdNodeFlags.DomNode & child.flag
        ? child.dom
        : getPreviousSibling(child, child.children.length)
    }
  }
  return (parent as RvdParent<RvdGroupNode>).previousSibling
}
