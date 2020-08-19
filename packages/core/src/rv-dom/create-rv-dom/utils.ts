export function getRootDomElement(
  element?: Element,
  querySelector?: string
): Element | null {
  if (!element && (!window || !window.document)) {
    throw Error('Document is undefined')
  }

  if (element && querySelector) {
    return element.querySelector(querySelector)
  }

  if (element) {
    return element
  }

  if (querySelector) {
    return window.document.querySelector(querySelector)
  }

  return window.document.body
}
