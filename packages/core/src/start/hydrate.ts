import { Subscription } from '@atom-iq/rx'

import { CombinedMiddlewares, RvdStaticChild } from 'types'

import { initRootRvd, initRvdContext, renderRootRvd } from './init'
import { start } from './start'

/**
 * Hydrate Reactive Virtual DOM
 *
 * Takes root Reactive Virtual DOM Element (most likely Component), root DOM Element and optionally
 * middlewares. Initializes root Context object, init Middlewares and Reactive Event Delegation
 * System, and then starts connecting Reactive Virtual DOM Nodes to existing DOM nodes recursively,
 * from root Element.
 * @param rootRvdElement
 * @param rootDom
 * @param middlewares
 */
export function hydrate<P>(
  rootRvdElement: RvdStaticChild<P>,
  rootDom: Element,
  middlewares?: CombinedMiddlewares
): Subscription {
  if (!rootRvdElement) {
    throw Error('Root RvdElement cannot be undefined or null')
  }

  if (!rootDom) {
    throw Error('Root DOM Element cannot be undefined or null')
  }

  // If root dom element has not children, start normal rendering
  if (!rootDom.firstChild) return start<P>(rootRvdElement, rootDom, middlewares)

  const context = initRvdContext(rootDom, middlewares, true)

  const rootDomRvd = initRootRvd(rootDom)

  renderRootRvd(rootRvdElement, rootDomRvd, context)

  context.$.hydrate = false

  return rootDomRvd.sub
}
