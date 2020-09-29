import { isString } from '../../shared/utils'

const getElementOrSelector = (elementOrQuerySelector): [Element, string] => {
  if (!elementOrQuerySelector) {
    return [null, null]
  }

  return [
    !isString(elementOrQuerySelector) &&
    elementOrQuerySelector instanceof Element &&
    elementOrQuerySelector,
    isString(elementOrQuerySelector) && elementOrQuerySelector
  ]
}

export function getRootDomElement(
  elementOrQuerySelector?: Element | string
): Element | null {
  const [element, querySelector] = getElementOrSelector(elementOrQuerySelector)

  if (element) {
    return element
  }

  if ((!window || !window.document)) {
    throw new Error('Atom-iQ RvDOM Renderer Error: Element/Document is undefined')
  }

  if (querySelector) {
    return window.document.querySelector(querySelector)
  }

  return window.document.body
}
