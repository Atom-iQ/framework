import type {
  AtomiqContextKey,
  RvdContext,
  RvdMiddlewares,
  RvdNode,
  RvdParent,
  RvdRenderer
} from 'types'
import { isFunction } from '@atom-iq/fx'

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
 * @param middlewaresOrInitContext
 * @param middlewares
 */
export const hydrate: RvdRenderer = <P>(
  rootRvdElement: RvdNode<P>,
  rootDom: Element,
  middlewaresOrInitContext?: RvdMiddlewares | (() => Omit<RvdContext, AtomiqContextKey>) | never,
  middlewares?: RvdMiddlewares | never
): RvdParent<RvdNode<P>> => {
  if (!rootRvdElement) {
    throw Error('Root RvdElement cannot be undefined or null')
  }

  if (!rootDom) {
    throw Error('Root DOM Element cannot be undefined or null')
  }

  // If root dom element has not children, start normal rendering
  if (!rootDom.firstChild) {
    return start<P>(rootRvdElement, rootDom, middlewaresOrInitContext, middlewares)
  }

  const context = initRvdContext(
    rootDom,
    middlewares || (!isFunction(middlewaresOrInitContext) && middlewaresOrInitContext),
    isFunction(middlewaresOrInitContext) && middlewaresOrInitContext(),
    true
  )

  const rootDomRvd = initRootRvd(rootDom)

  const resultRvd = renderRootRvd(rootRvdElement, rootDomRvd, context)

  context.$.hydrate = false

  return resultRvd
}
