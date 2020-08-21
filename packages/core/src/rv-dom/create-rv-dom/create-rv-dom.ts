import { CreateRvDomFn, CreateRvDomFnConfig, RvdChild, RvdStaticChild } from '../../shared/types'
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
  rootRvdElement: RvdChild<P>,
  {
    querySelector,
    element
  }: CreateRvDomFnConfig
) => {
  console.log('Living')
  /**
   * Root DOM Element - already created and rendered DOM Element, where RvDOM
   * will be attached
   */
  const rootDOMElement: Element = getRootDomElement(element, querySelector)

  if (!rootRvdElement || !rootDOMElement) {
    throw new Error('Root RvdElement and Root Dom cannot be undefined or null')
  }

  return renderRootChild(rootRvdElement as RvdStaticChild<P>, rootDOMElement)
}

