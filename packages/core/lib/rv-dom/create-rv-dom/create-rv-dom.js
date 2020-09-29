import { getRootDomElement } from './utils.js';
import { renderRootChild } from '../renderer/element.js';

/**
 * Starting Reactive Virtual DOM rendering process - render given RvDOM tree
 * recursively (static/synchronous elements) and subscribe to asynchronous elements changes
 * @param rootRvdElement
 * @param querySelector
 * @param element
 */
const createRvDOM = (rootRvdElement, elementOrQuerySelector) => (middlewares) => {
    console.log('Living');
    /**
   * Root DOM Element - already created and rendered DOM Element, where RvDOM
   * will be attached
   */
    const rootDOMElement = getRootDomElement(elementOrQuerySelector);
    if (!rootRvdElement || !rootDOMElement) {
        throw new Error('Root RvdElement and Root Dom cannot be undefined or null');
    }
    return renderRootChild(rootRvdElement, rootDOMElement);
};

export { createRvDOM };
