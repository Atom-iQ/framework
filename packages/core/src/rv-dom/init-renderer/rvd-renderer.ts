import type { ReactiveVirtualDOMRenderer, RvdContext, RvdStaticChild } from '../../shared/types'
import { renderRootChild } from '../renderer'
import { initMiddlewares } from '../../middlewares/middlewares-manager'
import { Subscription } from 'rxjs'
import { initEventDelegation } from '../event-delegation/event-delegation'

/**
 * Reactive Virtual DOM Renderer
 *
 * Starting Reactive Virtual DOM Renderer. Could be optionally initialized with Middlewares and/or
 * rvDomId - it's for the case, when multiple Reactive Virtual DOM Renderers are running simultaneously,
 * Atom-iQ can manage Middlewares and Synthetic Events separately for those instances - thanks to it,
 * Atom-iQ Reactive Virtual DOM Renderers could be attached to multiple DOM Elements, in example as
 * interactive sections/plugins on static webpages.
 * Anyway, the main Atom-iQ target are Single Page Applications, where multiple Renderer instances
 * should be rather avoided.
 * @param middlewares
 * @param rvDomId
 */
export const rvdRenderer: ReactiveVirtualDOMRenderer = <P>(middlewares?, rvDomId?) =>
  /**
   * Init Reactive Virtual DOM
   *
   * Takes root Reactive Virtual DOM Element (most likely Component) and root DOM Element. Initializes
   * root Context object, init Middlewares and Reactive Synthetic Events System, and then starts
   * rendering and connecting Reactive Virtual DOM Elements recursively, from root Element
   * @param rootRvdElement
   * @param rootDOMElement
   */
  function initRvDOM(rootRvdElement: RvdStaticChild<P>, rootDOMElement: Element): Subscription {
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
      initMiddlewares(middlewares, rootRvdElement, rootDOMElement, context) as RvdStaticChild<P>,
      rootDOMElement,
      context
    )
  }
