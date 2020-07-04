import {rxComponent, rxDom} from 'rx-ui-shared/index';
import {getRootDomElement} from '../_utils/dom';
import {renderRxDom} from './render-rx-dom';

const createRxDOM: rxDom.CreateRxDomFn = <P>(
  rootNode: rxDom.RxNode<rxComponent.RxComponentProps>,
  {
    querySelector,
    element
  }: rxDom.CreateRxDomFnConfig<P>
) => {
  const rootDom = getRootDomElement(element, querySelector);

  if (!rootNode || !rootDom) {
    throw new Error('Root Node and Root Dom cannot be undefined or null');
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
  renderRxDom(rootNode).subscribe(rootConnectedDom => {
    // TODO: implement
  });
};
