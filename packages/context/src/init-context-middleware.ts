import type { InitMiddleware, RvdContext } from '@atom-iq/core'

/**
 * Init middleware for Atom-iQ Context
 *
 * Creating initial context fields, before rendering root
 * Reactive Virtual DOM element
 * @param initialContext
 */
export const initContextMiddleware: (
  initialContext?: RvdContext
) => InitMiddleware = initialContext => (rootRvdElement, _rootDOMElement, context) => {
  if (initialContext) {
    for (const fieldName in initialContext) {
      context[fieldName] = initialContext[fieldName]
    }
  }
  return rootRvdElement
}
