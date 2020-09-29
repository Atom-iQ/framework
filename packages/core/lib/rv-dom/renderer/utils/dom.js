// export type AdjacentPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';
function createDomElement(tag, isSVG) {
    if (isSVG) {
        return document.createElementNS('http://www.w3.org/2000/svg', tag);
    }
    return document.createElement(tag);
}
function createTextNode(stringOrNumber) {
    return document.createTextNode(String(stringOrNumber));
}
function appendChild(parentNode, newChild) {
    return parentNode.appendChild(newChild);
}
function insertBefore(parentNode, newChild, nextChild) {
    return parentNode.insertBefore(newChild, nextChild);
}
function replaceChild(parentNode, newChild, oldChild) {
    return !!parentNode.replaceChild(newChild, oldChild);
}
function removeChild(parentNode, childNode) {
    return !!parentNode.removeChild(childNode);
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

export { appendChild, createDomElement, createTextNode, insertBefore, removeChild, replaceChild };
