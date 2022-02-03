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

/**
 * Start Reactive Virtual DOM Renderer
 *
 * Takes root Reactive Virtual DOM Element (most likely Component), root DOM Element and optionally
 * middlewares. Initializes root Context object, init Middlewares and Reactive Event Delegation
 * System, and then starts rendering and connecting Reactive Virtual DOM Elements recursively,
 * from root Element.
 * @param rootRvdElement
 * @param rootDOMElement
 * @param middlewaresOrInitContext
 * @param middlewares
 */
export const start: RvdRenderer = <P>(
  rootRvdElement: RvdNode<P>,
  rootDOMElement: Element,
  middlewaresOrInitContext?: RvdMiddlewares | (() => Omit<RvdContext, AtomiqContextKey>) | never,
  middlewares?: RvdMiddlewares | never
): RvdParent<RvdNode<P>> => {
  if (!rootRvdElement) {
    throw Error('Root RvdElement cannot be undefined or null')
  }

  if (!rootDOMElement) {
    throw Error('Root DOM Element cannot be undefined or null')
  }

  const context = initRvdContext(
    rootDOMElement,
    middlewares || (!isFunction(middlewaresOrInitContext) && middlewaresOrInitContext),
    isFunction(middlewaresOrInitContext) && middlewaresOrInitContext()
  )

  const rootDomRvd = initRootRvd(rootDOMElement)

  return renderRootRvd(rootRvdElement, rootDomRvd, context)
}
