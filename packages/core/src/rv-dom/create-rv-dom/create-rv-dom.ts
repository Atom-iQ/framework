import type {
  CreateRvDomFn,
  RvdContext,
  RvdStaticChild,
  CombinedMiddlewares
} from '../../shared/types'
import { renderRootChild } from '../renderer'
import { initMiddlewares } from '../../middlewares/middlewares-manager'
import { Subscription } from 'rxjs'

/**
 * Starting Reactive Virtual DOM rendering process - render given RvDOM tree
 * recursively (static/synchronous elements) and subscribe to asynchronous elements changes
 * @param middlewares
 */
export const createRvDOM: CreateRvDomFn = <P>(middlewares?: CombinedMiddlewares) => (
  rootRvdElement: RvdStaticChild<P>,
  rootDOMElement: Element
): Subscription => {
  if (!rootRvdElement) {
    throw Error('Root RvdElement cannot be undefined or null')
  }

  if (!rootDOMElement) {
    throw Error('Root DOM Element cannot be undefined or null')
  }

  const context: RvdContext = {}

  return renderRootChild(
    initMiddlewares(middlewares, rootRvdElement, rootDOMElement, context) as RvdStaticChild<P>,
    rootDOMElement,
    context
  )
}
