import { CreateRvDomFn, CreateRvDomFnConfig, RvdElement } from '@@types'
import { getRootDomElement } from './utils'
import renderRootChild from '../renderer'

/**
 * Starting Reactive Virtual DOM rendering process - render given RvDOM tree
 * recursively (static/synchronous elements) and subscribe to asynchronous elements changes
 * @param rootRvdElement
 * @param querySelector
 * @param element
 */
export const createRvDOM: CreateRvDomFn = <P>(
  rootRvdElement: RvdElement<P>,
  {
    querySelector,
    element
  }: CreateRvDomFnConfig
) => {
  /**
   * Root DOM Element - already created and rendered DOM Element, where RvDOM
   * will be attached
   */
  const rootDOMElement: Element = getRootDomElement(element, querySelector)

  if (!rootRvdElement || !rootDOMElement) {
    throw new Error('Root RvdElement and Root Dom cannot be undefined or null')
  }

  return renderRootChild(rootRvdElement, rootDOMElement)
}

