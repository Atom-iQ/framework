import { RvdHTMLElementType, RvdSVGElementType } from '@@shared'

// export type AdjacentPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';

export function createDomElement(
  tag: RvdHTMLElementType | RvdSVGElementType,
  isSVG: boolean
): HTMLElement | SVGElement {
  if (isSVG) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag)
  }

  return document.createElement(tag)
}

export function createTextNode(stringOrNumber: string | number): Text {
  return document.createTextNode(String(stringOrNumber))
}

export function appendChild(parentNode: Node, newChild: Node): Node {
  return parentNode.appendChild(newChild)
}

export function insertBefore(parentNode: Node, newChild: Node, nextChild: Node): Node {
  return parentNode.insertBefore(newChild, nextChild)
}

export function replaceChild(parentNode: Node, newChild: Node, oldChild: Node): boolean {
  return !!parentNode.replaceChild(newChild, oldChild)
}

export function removeChild(parentNode: Node, childNode: Node): boolean {
  return !!parentNode.removeChild(childNode)
}

// /*
//  * New API
//  */
//
// export function append(parentElement: ParentNode, ...nodes: Array<Node | string>): void {
//   parentElement.append(...nodes)
// }
//
// export function prepend(parentElement: ParentNode, ...nodes: Array<Node | string>): void {
//   parentElement.prepend(...nodes)
// }
//
// export function after(siblingElement: ChildNode, ...nodes: Array<Node | string>): void {
//   siblingElement.after(...nodes)
// }
//
// export function before(siblingElement: ChildNode, ...nodes: Array<Node | string>): void {
//   siblingElement.before(...nodes)
// }
//
// export function insertOrAppend(
//   parentDOM: Element,
//   newNode: Node,
//   nextNode: Node
// ): Node {
//   if (isNull(nextNode)) {
//     return appendChild(parentDOM, newNode)
//   } else {
//     return parentDOM.insertBefore(newNode, nextNode)
//   }
// }
//
// export function insertAdjacentText(
//   parentOrSiblingDOM: Element,
//   text: string,
//   position: AdjacentPosition = 'afterbegin'
// ): void {
//   parentOrSiblingDOM.insertAdjacentText(position, text)
// }
//
// export function insertAdjacentElement(
//   parentDOM: Element,
//   element: Element,
//   position: AdjacentPosition = 'afterbegin'
// ): void {
//   parentDOM.insertAdjacentElement(position, element)
// }
