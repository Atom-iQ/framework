import { Subscription, SubscriptionGroup } from '@atom-iq/rx'

import type {
  CombinedMiddlewares,
  RvdContext,
  RvdElementNode,
  RvdElementNodeType,
  RvdParent,
  RvdStaticChild
} from 'types'
import { applyMiddlewares } from 'middlewares/middlewares-manager'
import { RvdNodeFlags } from 'shared/flags'
import { renderRvdStaticChild } from 'rvd/renderer'

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

  const context: RvdContext = {
    __iq__: {
      rootElement: rootDOMElement,
      delegationContainer: {},
      middlewares
    }
  }

  const rootDomRvd: RvdParent<RvdElementNode> = {
    type: rootDOMElement.nodeName as RvdElementNodeType,
    flag: RvdNodeFlags.HtmlElement,
    sub: new SubscriptionGroup(),
    dom: rootDOMElement as HTMLElement,
    children: []
  }

  renderRvdStaticChild(
    applyMiddlewares('init', context, rootRvdElement, rootDomRvd),
    0,
    rootDomRvd,
    context
  )

  return rootDomRvd.sub
}
