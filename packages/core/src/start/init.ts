import { groupSub } from '@atom-iq/rx'

import type {
  RvdMiddlewares,
  RvdContext,
  RvdElementNode,
  RvdElementNodeType,
  AtomiqContextKey
} from 'types'
import { RvdNodeFlags } from 'shared/flags'

export function initRootRvdContext(
  rootDOMElement: Element,
  middlewares?: RvdMiddlewares,
  initialContext?: Omit<RvdContext, AtomiqContextKey>,
  hydrate = false
): RvdContext {
  const context: RvdContext = {
    $: {
      rootElement: rootDOMElement,
      delegationContainer: {},
      hydrate,
      element: middlewares.element || null,
      text: middlewares.text || null,
      component: middlewares.component || null
    }
  }
  return initialContext ? Object.assign(initialContext, context) : context
}

export function initRootDomRvdNode(rootDOMElement: Element): RvdElementNode {
  return {
    type: rootDOMElement.nodeName as RvdElementNodeType,
    flag: RvdNodeFlags.HtmlElement,
    sub: groupSub(),
    dom: rootDOMElement as HTMLElement,
    live: []
  }
}
