import type { RvdDOMElementType } from '../../../shared/types'

export function createDomElement(tag: RvdDOMElementType, isSVG = false): HTMLElement | SVGElement {
  if (isSVG) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag)
  }

  return document.createElement(tag)
}

export function createTextNode(stringOrNumber: string | number): Text {
  return document.createTextNode(stringOrNumber + '')
}

export function appendChild(parentNode: Node, newChild: Node): Node {
  return parentNode.appendChild(newChild)
}

export function insertBefore(parentNode: Node, newChild: Node, nextChild: Node): Node {
  return parentNode.insertBefore(newChild, nextChild)
}

export function replaceChild(parentNode: Node, newChild: Node, oldChild: Node): Node {
  return parentNode.replaceChild(newChild, oldChild)
}

export function removeChild(parentNode: Node, childNode: Node): Node {
  return parentNode.removeChild(childNode)
}
