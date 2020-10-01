import {
  CreateRvDomFn,
  CreateRvDomFnConfig,
  RvdChild,
  RvdStaticChild,
  RxSub
} from '../../shared/types'
import { getRootDomElement } from './utils'
import renderRootChild from '../renderer'

/**
 * Starting Reactive Virtual DOM rendering process - render given RvDOM tree
 * recursively (static/synchronous elements) and subscribe to asynchronous elements changes
 * @param middlewares
 */
export const createRvDOM: CreateRvDomFn = <P>(middlewares?: []) => (
  rootRvdElement: RvdChild<P>,
  elementOrQuerySelector?: Element | string
): RxSub => {
  console.log('rvDOM START')
  /**
   * Root DOM Element - already created and rendered DOM Element, where RvDOM
   * will be attached
   */
  const rootDOMElement: Element = getRootDomElement(elementOrQuerySelector)

  if (!rootRvdElement || !rootDOMElement) {
    throw new Error('Root RvdElement and Root Dom cannot be undefined or null')
  }

  return renderRootChild(rootRvdElement as RvdStaticChild<P>, rootDOMElement)
}
