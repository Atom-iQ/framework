import { isFunction } from '@atom-iq/fx'

import type {
  AtomiqContextKey,
  ConnectRenderer,
  RvdChild,
  RvdContext,
  RvdElementNode,
  RvdMiddlewares,
  RvdRenderer
} from 'types';
import { renderRvdChild } from 'renderer';

import { initRootDomRvdNode, initRootRvdContext } from './init'

/**
 * Start Reactive Virtual DOM Renderer
 *
 * Takes root Reactive Virtual DOM Element (most likely Component), root DOM Element and optionally
 * middlewares. Initializes root Context object, init Middlewares and Reactive Event Delegation
 * System, and then starts rendering and connecting Reactive Virtual DOM Elements recursively,
 * from root Element.
 * @param rootRvdChild
 * @param middlewaresOrInitContext
 * @param middlewares
 */
export const start: RvdRenderer = <P>(
  rootRvdChild: RvdChild<P>,
  middlewaresOrInitContext?: RvdMiddlewares | (() => Omit<RvdContext, AtomiqContextKey>) | never,
  middlewares?: RvdMiddlewares | never
): ConnectRenderer => {
  if (!rootRvdChild) {
    throw Error('Root RvdElement cannot be undefined or null')
  }

  return rootDOMElement => {
    if (!rootDOMElement) {
      throw Error('Root DOM Element cannot be undefined or null')
    }

    const context = initRootRvdContext(
      rootDOMElement,
      middlewares || (!isFunction(middlewaresOrInitContext) && middlewaresOrInitContext),
      isFunction(middlewaresOrInitContext) && middlewaresOrInitContext()
    )

    const rootDomRvd = initRootDomRvdNode(rootDOMElement)

    renderRvdChild(0, rootRvdChild, rootDomRvd, context)

    return rootDomRvd
  }
}
