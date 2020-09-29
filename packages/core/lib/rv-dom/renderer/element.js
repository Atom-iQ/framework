import { Subscription, isObservable } from 'rxjs';
import { childTypeSwitch, isSvgElement, renderTypeSwitch } from './utils/check-type.js';
import { createDomElement } from './utils/dom.js';
import 'rxjs/operators';
import { connectElementProps } from './element-props.js';
import createChildrenManager from './utils/children-manager.js';
import { staticTextRenderCallback, textRenderCallback } from './render-callback/text.js';
import nullRenderCallback from './render-callback/null.js';
import { renderElement, replaceFragmentForElement, replaceElementForElement } from './render-callback/element.js';
import { staticFragmentRenderCallback, staticArrayRenderCallback, arrayRenderCallback, fragmentRenderCallback } from './render-callback/fragment.js';
import { renderRvdComponent } from './component.js';

/* -------------------------------------------------------------------------------------------
 *  Element renderer callbacks
 * ------------------------------------------------------------------------------------------- */
const elementRenderCallback = (childIndex, element, createdChildren, childrenSubscription) => (child) => {
    const elementNode = renderRvdElement(child);
    const renderFn = renderElement(elementNode, childIndex, element, createdChildren, childrenSubscription);
    renderTypeSwitch(replaceElementForElement(elementNode, childIndex, element, createdChildren, childrenSubscription), replaceFragmentForElement(renderFn, elementNode, childIndex, element, createdChildren), renderFn)(childIndex, createdChildren);
};
/**
 * One time renderer callback - if child isn't Observable, then it will not
 * change in runtime, function will be called just once and it's sure that
 * no other node was rendered on that position
 * @param childIndex
 * @param element
 * @param createdChildren
 * @param childrenSubscription
 */
const staticElementRenderCallback = (childIndex, element, createdChildren, childrenSubscription) => (child) => {
    const elementNode = renderRvdElement(child);
    renderElement(elementNode, childIndex, element, createdChildren, childrenSubscription)();
};
/* -------------------------------------------------------------------------------------------
 *  Fragment renderer helper
 * ------------------------------------------------------------------------------------------- */
const renderNewFragmentChild = (element, createdChildren, childrenSubscription) => (child, childIndex) => renderObservableChild(childIndex, element, createdChildren, childrenSubscription)(child);
/* -------------------------------------------------------------------------------------------
 *  Element Children Rendering functions
 * ------------------------------------------------------------------------------------------- */
/**
 * @params ...args - DOM Element, string child index, children map and children subscription
 * @returns Static child rendering function that is checking static child type and calling
 * specific callback for given child type
 */
const renderStaticChild = (...args) => {
    const [childIndex, element, createdChildren, childrenSubscription] = args;
    return childTypeSwitch(null, staticTextRenderCallback(...args), staticArrayRenderCallback(childIndex, element, createdChildren, childrenSubscription, renderNewFragmentChild(element, createdChildren, childrenSubscription)), renderRvdComponent(childIndex, element, createdChildren, childrenSubscription, renderNewFragmentChild(element, createdChildren, childrenSubscription)), staticFragmentRenderCallback(childIndex, element, createdChildren, childrenSubscription, renderNewFragmentChild(element, createdChildren, childrenSubscription)), staticElementRenderCallback(...args));
};
/**
 * @params ...args - DOM Element, string child index, children map and children subscription
 * @returns Static child rendering function that is checking static child type and calling
 * specific callback for given child type
 */
const renderObservableChild = (...args) => {
    const [childIndex, element, createdChildren, childrenSubscription] = args;
    return childTypeSwitch(nullRenderCallback(...args), textRenderCallback(...args), arrayRenderCallback(childIndex, element, createdChildren, childrenSubscription, renderNewFragmentChild(element, createdChildren, childrenSubscription)), renderRvdComponent(childIndex, element, createdChildren, childrenSubscription, renderNewFragmentChild(element, createdChildren, childrenSubscription)), fragmentRenderCallback(childIndex, element, createdChildren, childrenSubscription, renderNewFragmentChild(element, createdChildren, childrenSubscription)), elementRenderCallback(...args));
};
/**
 * Closure with child element rendering function. Taking common params
 * for all children and returning function for single child rendering.
 * @param element - parent DOM Element
 * @param createdChildrenMap - extended CustomMap object, with nested indexes
 * sorting utility
 * @param childrenSubscription - parent subscription for all
 * children element subscriptions
 * @returns Child rendering function, that is checking if child
 * is Observable. If yes, subscribing to it, calling static
 * child rendering function for every new emitted value and adding
 * subscription to childrenSubscription. If no, calling static
 * child rendering function just once
 */
const renderChild = (element, createdChildrenMap, childrenSubscription) => (child, index) => {
    const childIndex = String(index);
    if (isObservable(child)) {
        const childSub = child.subscribe(renderObservableChild(childIndex, element, createdChildrenMap, childrenSubscription));
        childrenSubscription.add(childSub);
    }
    else {
        renderStaticChild(childIndex, element, createdChildrenMap, childrenSubscription)(child);
    }
};
/**
 * Main children rendering function - creates parent subscription for children
 * subscriptions and children map object for keeping information about all children
 * between renderer callbacks. Calling {@link renderChild} for every child
 * @param children - An array of child elements
 * @param element - DOM Element of currently creating RvdNode, that will be
 * a parent for rendered elements from children array
 * @returns Subscription with aggregated children subscriptions,
 * that will be attached to main element subscription
 */
const renderChildren = (children, element) => {
    const childrenSubscription = new Subscription();
    const createdChildren = createChildrenManager();
    children.forEach(renderChild(element, createdChildren, childrenSubscription));
    return childrenSubscription;
};
/**
 * Render Rvd DOM Element and return it with subscription to parent
 * @param rvdElement
 */
function renderRvdElement(rvdElement) {
    const element = createDomElement(rvdElement.type, isSvgElement(rvdElement));
    const elementSubscription = connectElementProps(rvdElement, element);
    if (rvdElement.children) {
        const childrenSubscription = renderChildren(rvdElement.children, element);
        elementSubscription.add(childrenSubscription);
    }
    return {
        dom: element,
        elementSubscription
    };
}
/**
 * Function called at application start - called only once in createRvDOM. It's creating Root
 * Rendering Context, in where it's managing rendering of root element children. It's returning
 * root aggregated subscription.
 * @param rootRvdElement
 * @param rootDOMElement
 */
function renderRootChild(rootRvdElement, rootDOMElement) {
    console.log('rootChild');
    /**
     * Root RvDOM Subscription - aggregating all application subscriptions
     * NOTE - Subscriptions in RvDOM:
     *    Subscriptions are aggregated on the element level (Element rendering context).
     *    Every element's aggregated subscription could have subscriptions for element's
     *    observable props and aggregated subscriptions from children elements. Thanks
     *    to it, when the top level element is removed from DOM, all nested elements
     *    subscriptions are unsubscribed automatically.
     *
     * Root Subscription exists on the root DOM Element's level - Root Rendering Context.
     *
     * Root Rendering Context is the only one rendering context, where element (root DOM Element)
     * is coming from outside of RvDOM Renderer - therefore root Element is only partially controlled
     * by RvDOM Renderer - it's created and rendered outside (it's attributes are also attached
     * outside), before a start of RvDOM, but it's children rendering is controlled inside renderer.
     *
     * So Root Subscription contains only aggregated children subscriptions and don't contain
     * props subscriptions.
     */
    const rootSubscription = new Subscription();
    /**
     * Root Children Manager - children manager for Root Rendering Context - managing
     * rendering root element child or children (when root RvdElement is Fragment or
     * fragment or array returned from component, etc.)
     */
    const rootChildrenManager = createChildrenManager();
    /**
     * Root Child Index - in Root Rendering Context, given RvdElement will always be considered
     * as one and only child of root DOM Element, so it always has '0' as index (in current version).
     * TODO: Some next version - allow attaching RvDOM to element with rendered children - render
     * TODO: root RvdElement as last child (compute rootChildIndex instead of hardcode)
     */
    const rootChildIndex = '0';
    /**
     * Call render static child function, passing Root DOM Element as parent element
     */
    renderStaticChild(rootChildIndex, rootDOMElement, rootChildrenManager, rootSubscription)(rootRvdElement);
    /**
     * Return root aggregated subscription outside
     */
    return rootSubscription;
}

export { renderRootChild };
