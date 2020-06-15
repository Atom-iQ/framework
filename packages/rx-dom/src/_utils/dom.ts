import dom from '../../../rx-ui-shared/src/types/dom/dom';
import {isNull} from 'rx-ui-shared';

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

export function appendChild(parentDOM: Node, dom: Node): void {
  parentDOM.appendChild(dom);
}

export function insertOrAppend(
  parentDOM: Element,
  newNode: Node,
  nextNode: Node
): void {
  if (isNull(nextNode)) {
    appendChild(parentDOM, newNode);
  } else {
    parentDOM.insertBefore(newNode, nextNode);
  }
}

export function domCreateElement(
  tag: dom.HtmlElementName,
  isSVG: boolean
): Element {
  if (isSVG) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }

  return document.createElement(tag);
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
