import { SubscriptionGroup } from '@atom-iq/rx'
import type {
  CombinedMiddlewares,
  RvdContext,
  RvdElementNode,
  RvdElementNodeType,
  RvdParent,
  RvdStaticChild
} from 'types'
import { RvdNodeFlags } from 'shared/flags'
import { renderRvdStaticChild } from 'renderer'
import { applyMiddlewares } from 'middlewares/middlewares-manager'

export function initRvdContext(
  rootDOMElement: Element,
  middlewares?: CombinedMiddlewares,
  hydrate = false
): RvdContext {
  return {
    $: {
      rootElement: rootDOMElement,
      delegationContainer: {},
      middlewares,
      hydrate
    }
  }
}

export function initRootRvd(rootDOMElement: Element): RvdParent<RvdElementNode> {
  return {
    type: rootDOMElement.nodeName as RvdElementNodeType,
    flag: RvdNodeFlags.HtmlElement,
    sub: new SubscriptionGroup(),
    dom: rootDOMElement as HTMLElement,
    children: []
  }
}

export function renderRootRvd(
  rootRvdElement: RvdStaticChild,
  rootDomRvd: RvdParent<RvdElementNode>,
  context: RvdContext
): void {
  renderRvdStaticChild(
    applyMiddlewares('init', context, rootRvdElement, rootDomRvd),
    0,
    rootDomRvd,
    context
  )
}
