import {CreateRvDomFn, CreateRvDomFnConfig, RvdElement} from '@@types'
import {getRootDomElement} from '../render/utils'

const createRvDOM: CreateRvDomFn = <P>(
  rootRvdElement: RvdElement,
  {
    querySelector,
    element
  }: CreateRvDomFnConfig<P>
) => {
  const rootDom = getRootDomElement(element, querySelector)

  if (!rootRvdElement || !rootDom) {
    throw new Error('Root RvdElement and Root Dom cannot be undefined or null')
  }



  /* ----------------------------------------------
   * rootNode may look like this:
   * {
   *   type: App,
   *   props: {}
   *   children: null
   *   _component: App
   * }
   * ------------------------------------------- */
  // TODO: Implement rendering and subscribing to rootNode
  // renderRvDom(rootRvdElement).subscribe(rootConnectedDom => {
  // TODO: implement
  // })
}

export default createRvDOM
