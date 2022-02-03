import { groupSub } from '@atom-iq/rx'
import type {
  RvdMiddlewares,
  RvdContext,
  RvdElementNode,
  RvdElementNodeType,
  RvdParent,
  RvdNode
} from 'types'
import { RvdNodeFlags } from 'shared/flags'
import { renderRvdStaticChild } from 'renderer'
import { AtomiqContextKey } from 'types'

export function initRvdContext(
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

export function initRootRvd(rootDOMElement: Element): RvdParent<RvdElementNode> {
  return {
    type: rootDOMElement.nodeName as RvdElementNodeType,
    flag: RvdNodeFlags.HtmlElement,
    sub: groupSub(),
    dom: rootDOMElement as HTMLElement,
    children: []
  }
}

export function renderRootRvd<P>(
  rootRvdElement: RvdNode<P>,
  rootDomRvd: RvdParent<RvdElementNode>,
  context: RvdContext
): RvdParent<RvdNode<P>> {
  renderRvdStaticChild(rootRvdElement, 0, rootDomRvd, context)
  return rootRvdElement as RvdParent<RvdNode<P>>
}
