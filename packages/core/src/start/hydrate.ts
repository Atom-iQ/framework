import { isFunction } from '@atom-iq/fx'

import type {
  AtomiqContextKey,
  RvdContext,
  RvdElementNode,
  RvdMiddlewares,
  RvdRenderer,
  RvdChild, ConnectRenderer
} from "types";
import { renderRvdChild } from 'renderer';

import { initRootDomRvdNode, initRootRvdContext } from './init'
import { start } from './start'

/**
 * Hydrate Reactive Virtual DOM
 *
 * Takes root Reactive Virtual DOM Element (most likely Component), root DOM Element and optionally
 * middlewares. Initializes root Context object, init Middlewares and Reactive Event Delegation
 * System, and then starts connecting Reactive Virtual DOM Nodes to existing DOM nodes recursively,
 * from root Element.
 * @param rootRvdChild
 * @param rootDom
 * @param middlewaresOrInitContext
 * @param middlewares
 */
export const hydrate: RvdRenderer = <P>(
  rootRvdChild: RvdChild<P>,
  middlewaresOrInitContext?: RvdMiddlewares | (() => Omit<RvdContext, AtomiqContextKey>) | never,
  middlewares?: RvdMiddlewares | never
): ConnectRenderer => {
  if (!rootRvdChild) {
    throw Error('Root RvdElement cannot be undefined or null')
  }

  return rootDom => {
    if (!rootDom) {
      throw Error('Root DOM Element cannot be undefined or null')
    }

    // If root dom element has not children, start normal rendering
    if (!rootDom.firstChild) {
      return start<P>(rootRvdChild, middlewaresOrInitContext, middlewares)(rootDom)
    }

    const context = initRootRvdContext(
      rootDom,
      middlewares || (!isFunction(middlewaresOrInitContext) && middlewaresOrInitContext),
      isFunction(middlewaresOrInitContext) && middlewaresOrInitContext(),
      true
    )

    const rootDomRvd = initRootDomRvdNode(rootDom)

    renderRvdChild(0, rootRvdChild, rootDomRvd, context)

    context.$.hydrate = false

    return rootDomRvd
  }
}
