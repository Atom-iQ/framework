import type { Subscription } from '@atom-iq/rx'
import type { CombinedMiddlewares, RvdStaticChild } from 'types'

import { initRootRvd, initRvdContext, renderRootRvd } from './init'

/**
 * Start Reactive Virtual DOM Renderer
 *
 * Takes root Reactive Virtual DOM Element (most likely Component), root DOM Element and optionally
 * middlewares. Initializes root Context object, init Middlewares and Reactive Event Delegation
 * System, and then starts rendering and connecting Reactive Virtual DOM Elements recursively,
 * from root Element.
 * @param rootRvdElement
 * @param rootDOMElement
 * @param middlewares
 */
export function start<P>(
  rootRvdElement: RvdStaticChild<P>,
  rootDOMElement: Element,
  middlewares?: CombinedMiddlewares
): Subscription {
  if (!rootRvdElement) {
    throw Error('Root RvdElement cannot be undefined or null')
  }

  if (!rootDOMElement) {
    throw Error('Root DOM Element cannot be undefined or null')
  }

  const context = initRvdContext(rootDOMElement, middlewares)

  const rootDomRvd = initRootRvd(rootDOMElement)

  renderRootRvd(rootRvdElement, rootDomRvd, context)

  return rootDomRvd.sub
}
