import {isNull} from 'rx-ui-shared';

export type AdjacentPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';

export function getRootDomElement(
  element?: Element,
  querySelector?: string
): Element | null {
  if (!element && (!window || !window.document)) {
    throw Error('Document is undefined');
  }

  if (element && querySelector) {
    return element.querySelector(querySelector);
  }

  if (element) {
    return element;
  }

  if (querySelector) {
    return window.document.querySelector(querySelector);
  }

  return window.document.body;
}

export function appendChild(parentDOM: Node, dom: Node): Node {
  return parentDOM.appendChild(dom);
}

export function append(parentElement: ParentNode, ...nodes: Array<Node | string>): void {
  parentElement.append(...nodes);
}

export function prepend(parentElement: ParentNode, ...nodes: Array<Node | string>): void {
  parentElement.prepend(...nodes);
}

export function after(siblingElement: ChildNode, ...nodes: Array<Node | string>): void {
  siblingElement.after(...nodes);
}

export function before(siblingElement: ChildNode, ...nodes: Array<Node | string>): void {
  siblingElement.before(...nodes);
}

export function insertOrAppend(
  parentDOM: Element,
  newNode: Node,
  nextNode: Node
): Node {
  if (isNull(nextNode)) {
    return appendChild(parentDOM, newNode);
  } else {
    return parentDOM.insertBefore(newNode, nextNode);
  }
}

export function insertAdjacentText(
  parentOrSiblingDOM: Element,
  text: string,
  position: AdjacentPosition = 'afterbegin'
): void {
  parentOrSiblingDOM.insertAdjacentText(position, text);
}

export function insertAdjacentElement(
  parentDOM: Element,
  element: Element,
  position: AdjacentPosition = 'afterbegin'
): void {
  parentDOM.insertAdjacentElement(position, element);
}

export function createDomElement(
  tag: string,
  isSVG: boolean
): Element {
  if (isSVG) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }

  return document.createElement(tag);
}

export function createTextNode(stringOrNumber: string | number): Text {
  return document.createTextNode(String(stringOrNumber));
}

export function replaceChild(
  parentDOM: Element,
  newDom: Node,
  lastDom: Node
): void {
  parentDOM.replaceChild(newDom, lastDom);
}

export function removeChild(parentDOM: Element, childNode: Element): void {
  parentDOM.removeChild(childNode);
}
