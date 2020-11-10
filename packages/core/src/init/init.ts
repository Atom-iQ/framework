import type { CombinedMiddlewares, RvdChild, RvdContext, RvdStaticChild } from '../shared/types'
import { Subscription } from 'rxjs'
import { renderRootChild } from '../reactive-virtual-dom/renderer'
import { initMiddlewares } from '../middlewares/middlewares-manager'
import { initEventDelegation } from '../reactive-event-delegation/event-delegation'

/**
 * Init Atom-iQ
 *
 * Starting Atom-iQ app. Could be optionally initialized with Middlewares and/or
 * rvDomId - it's for the case, when multiple Reactive Virtual DOM Renderers are running simultaneously,
 * Atom-iQ can manage Middlewares and Synthetic Events separately for those instances - thanks to it,
 * Atom-iQ Reactive Virtual DOM Renderers could be attached to multiple DOM Elements, in example as
 * interactive sections/plugins on static webpages.
 * Anyway, the main Atom-iQ target are Single Page Applications, where multiple Renderer instances
 * should be rather avoided.
 * @param middlewares
 * @param rvDomId
 */
export function initAtomiQ<P>(middlewares?: CombinedMiddlewares, rvDomId?: string) {
  /**
   * Reactive Virtual DOM Renderer
   *
   * Takes root Reactive Virtual DOM Element (most likely Component) and root DOM Element. Initializes
   * root Context object, init Middlewares and Reactive Event Delegation System, and then starts
   * rendering and connecting Reactive Virtual DOM Elements recursively, from root Element
   * @param rootRvdElement
   * @param rootDOMElement
   */
  return function rvdRenderer(rootRvdElement: RvdChild<P>, rootDOMElement: Element): Subscription {
    if (!rootRvdElement) {
      throw Error('Root RvdElement cannot be undefined or null')
    }

    if (!rootDOMElement) {
      throw Error('Root DOM Element cannot be undefined or null')
    }

    const context: RvdContext = {}

    if (rvDomId) {
      context.__rvDomId = rvDomId
    }

    initEventDelegation(rootDOMElement, rvDomId)

    return renderRootChild(
      initMiddlewares(
        middlewares,
        rootRvdElement as RvdStaticChild<P>,
        rootDOMElement,
        context
      ) as RvdStaticChild<P>,
      rootDOMElement,
      context
    )
  }
}
