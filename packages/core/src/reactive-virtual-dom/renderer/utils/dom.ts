import type { RvdElementNodeType } from '../../../shared/types'

export function createDomElement(tag: RvdElementNodeType, isSVG = false): HTMLElement | SVGElement {
  if (isSVG) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag)
  }

  return document.createElement(tag)
}

export function createTextNode(stringOrNumber: string | number): Text {
  return document.createTextNode(stringOrNumber + '')
}
