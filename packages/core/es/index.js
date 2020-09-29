import { Subscription, isObservable, fromEvent, BehaviorSubject, ReplaySubject, pipe, throwError } from 'rxjs';
import { map, first, tap, catchError } from 'rxjs/operators';
export { c as createElement } from './create-element-8b180327.js';

/**
 * @function isArray
 */
const isArray = Array.isArray;
function isStringOrNumber(value) {
    const type = typeof value;
    return type === 'string' || type === 'number';
}
function isNullOrUndef(value) {
    return value === void 0 || value === null;
}
function isFunction(value) {
    return typeof value === 'function';
}
function isString(value) {
    return typeof value === 'string';
}
function isBoolean(value) {
    return value === true || value === false;
}
function isIndexFirstInArray(index) {
    return index === 0;
}
function isIndexLastInArray(index, array) {
    return index === array.length - 1;
}

const getElementOrSelector = (elementOrQuerySelector) => {
    if (!elementOrQuerySelector) {
        return [null, null];
    }
    return [
        !isString(elementOrQuerySelector) &&
            elementOrQuerySelector instanceof Element &&
            elementOrQuerySelector,
        isString(elementOrQuerySelector) && elementOrQuerySelector
    ];
};
function getRootDomElement(elementOrQuerySelector) {
    const [element, querySelector] = getElementOrSelector(elementOrQuerySelector);
    if (element) {
        return element;
    }
    if ((!window || !window.document)) {
        throw new Error('Atom-iQ RvDOM Renderer Error: Element/Document is undefined');
    }
    if (querySelector) {
        return window.document.querySelector(querySelector);
    }
    return window.document.body;
}

const SVGElementTypes = [
    'svg',
    'animate',
    'animateTransform',
    'circle',
    'clipPath',
    'defs',
    'desc',
    'ellipse',
    'feBlend',
    'feColorMatrix',
    'feComponentTransfer',
    'feComposite',
    'feConvolveMatrix',
    'feDiffuseLighting',
    'feDisplacementMap',
    'feDistantLight',
    'feFlood',
    'feFuncA',
    'feFuncB',
    'feFuncG',
    'feFuncR',
    'feGaussianBlur',
    'feImage',
    'feMerge',
    'feMergeNode',
    'feMorphology',
    'feOffset',
    'fePointLight',
    'feSpecularLighting',
    'feSpotLight',
    'feTile',
    'feTurbulence',
    'filter',
    'foreignObject',
    'g',
    'image',
    'line',
    'linearGradient',
    'marker',
    'mask',
    'metadata',
    'path',
    'pattern',
    'polygon',
    'polyline',
    'radialGradient',
    'rect',
    'stop',
    'switch',
    'symbol',
    'text',
    'textPath',
    'tspan',
    'use',
    'view'
];

/**
 * Fragment element type
 */
const _FRAGMENT = '_Fragment';

/**
 * Compare function for sortNestedIndexes()
 * @param {string} indexA
 * @param {string} indexB
 * @returns {number}
 */
const nestedIndexCompare = (indexA, indexB) => {
    const partsOfIndexA = indexA.split('.');
    const partsOfIndexB = indexB.split('.');
    if (partsOfIndexA.length > partsOfIndexB.length) {
        for (let i = 0; i < partsOfIndexB.length; i++) {
            const partToCheckA = Number(partsOfIndexA[i]);
            const partToCheckB = Number(partsOfIndexB[i]);
            if (partToCheckA !== partToCheckB) {
                return partToCheckA - partToCheckB;
            }
        }
    }
    else {
        for (let i = 0; i < partsOfIndexA.length; i++) {
            const partToCheckA = Number(partsOfIndexA[i]);
            const partToCheckB = Number(partsOfIndexB[i]);
            if (partToCheckA !== partToCheckB) {
                return partToCheckA - partToCheckB;
            }
        }
    }
    return 0;
};
/**
 * Sorting function for Array.prototype.sort() callback.
 * Sorting indexes which could be nested (it means ie. '1', but also '1.0.2')
 * @example
 * Before: ['4', '3', '3.4', '3.1', '0', '3.3', '3.3.1', '6', '3.2', '3.3.0' '5', '1', '3.0']
 * After: ['0', '1', '3', '3.0', '3.1', '3.2', '3.3', '3.3.0', '3.3.1', '3.4', '4', '5', '6']
 * @func sortNestedIndexes
 * @param {string[]} indexes - have to be string of /^\d+(.\d+)*$/ pattern ('1' or '3.0.23' etc.)
 * @returns {string[]}
 */
var sortNestedIndexes = (indexes) => indexes.sort(nestedIndexCompare);

/*
 * ELEMENTS
 */
/**
 * Check if given child is element (Component, Fragment, DOM Element)
 * @param rvdChild
 */
function isRvdElement(rvdChild) {
    return !!(rvdChild && rvdChild.type);
}
/**
 * Check if given element is Component
 * @param rvdElement
 */
function isComponent(rvdElement) {
    return Boolean(isFunction(rvdElement.type) && rvdElement._component);
}
/**
 * Check if given element is Fragment
 * @param rvdElement
 */
function isFragment(rvdElement) {
    return isString(rvdElement.type) && rvdElement.type === _FRAGMENT;
}
/**
 * Check if given element is DOM Element
 * @param rvdElement
 */
function isElement(rvdElement) {
    return isString(rvdElement.type) && rvdElement.type !== _FRAGMENT;
}
/**
 * Check if given DOM Element is SVG Element
 * @param rvdElement
 */
function isSvgElement(rvdElement) {
    return SVGElementTypes.includes(rvdElement.type);
}
function childTypeSwitch(nullCallback, textCallback, arrayCallback, componentCallback, fragmentCallback, elementCallback) {
    return child => {
        console.log('Child Type Switch: ', child);
        if (isNullOrUndef(child) || isBoolean(child)) {
            return nullCallback && nullCallback();
        }
        else if (isStringOrNumber(child)) {
            return textCallback(child);
        }
        else if (isArray(child)) {
            console.log('IS ARRAY');
            return arrayCallback(child);
        }
        else if (isRvdElement(child)) {
            if (isComponent(child)) {
                return componentCallback(child);
            }
            else if (isFragment(child)) {
                return fragmentCallback(child);
            }
            else if (isElement(child)) {
                return elementCallback(child);
            }
        }
    };
}
function renderTypeSwitch(hasOneCallback, hasFragmentCallback, hasNothingCallback) {
    return (childIndex, createdChildren) => {
        console.log('Render type switch, child index: ', childIndex);
        if (createdChildren.has(childIndex)) {
            console.log('has one');
            return hasOneCallback(createdChildren.get(childIndex));
        }
        else if (createdChildren.hasFragment(childIndex)) {
            console.log('has many');
            return hasFragmentCallback(createdChildren.getFragment(childIndex));
        }
        else {
            console.log('has nothing');
            return hasNothingCallback !== undefined && hasNothingCallback();
        }
    };
}

// export type AdjacentPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';
function createDomElement(tag, isSVG) {
    if (isSVG) {
        return document.createElementNS('http://www.w3.org/2000/svg', tag);
    }
    return document.createElement(tag);
}
function createTextNode(stringOrNumber) {
    return document.createTextNode(String(stringOrNumber));
}
function appendChild(parentNode, newChild) {
    return parentNode.appendChild(newChild);
}
function insertBefore(parentNode, newChild, nextChild) {
    return parentNode.insertBefore(newChild, nextChild);
}
function replaceChild(parentNode, newChild, oldChild) {
    return !!parentNode.replaceChild(newChild, oldChild);
}
function removeChild(parentNode, childNode) {
    return !!parentNode.removeChild(childNode);
}
// /*
//  * New API
//  */
//
// export function append(parentElement: ParentNode, ...nodes: Array<Node | string>): void {
//   parentElement.append(...nodes)
// }
//
// export function prepend(parentElement: ParentNode, ...nodes: Array<Node | string>): void {
//   parentElement.prepend(...nodes)
// }
//
// export function after(siblingElement: ChildNode, ...nodes: Array<Node | string>): void {
//   siblingElement.after(...nodes)
// }
//
// export function before(siblingElement: ChildNode, ...nodes: Array<Node | string>): void {
//   siblingElement.before(...nodes)
// }
//
// export function insertOrAppend(
//   parentDOM: Element,
//   newNode: Node,
//   nextNode: Node
// ): Node {
//   if (isNull(nextNode)) {
//     return appendChild(parentDOM, newNode)
//   } else {
//     return parentDOM.insertBefore(newNode, nextNode)
//   }
// }
//
// export function insertAdjacentText(
//   parentOrSiblingDOM: Element,
//   text: string,
//   position: AdjacentPosition = 'afterbegin'
// ): void {
//   parentOrSiblingDOM.insertAdjacentText(position, text)
// }
//
// export function insertAdjacentElement(
//   parentDOM: Element,
//   element: Element,
//   position: AdjacentPosition = 'afterbegin'
// ): void {
//   parentDOM.insertAdjacentElement(position, element)
// }

const transformCssToJss = (cssPropName) => {
    return cssPropName;
};
const connectCssProperties = (styles, element, propsSubscription) => {
    Object.entries(styles).forEach(([cssPropName, cssPropValue]) => {
        const parsedCssPropName = cssPropName.includes('-') ?
            transformCssToJss(cssPropName) :
            cssPropName;
        if (isObservable(cssPropValue)) {
            propsSubscription.add(cssPropValue.subscribe(cssValue => {
                element.style[parsedCssPropName] = cssValue;
            }));
        }
        else {
            element.style[parsedCssPropName] = cssPropValue;
        }
    });
};
const connectStyleProp = (rvdElement, element, propsSubscription) => (propName, propValue) => {
    if (isObservable(propValue)) {
        propsSubscription.add(propValue.subscribe(styles => {
            if (isString(styles)) {
                element.setAttribute('style', styles);
            }
            else if (isNullOrUndef(styles)) {
                element.removeAttribute('style');
            }
            else {
                connectCssProperties(styles, element, propsSubscription);
            }
        }));
    }
    else if (isString(propValue)) {
        element.setAttribute('style', propValue);
    }
    else if (!isNullOrUndef(propValue)) {
        connectCssProperties(propValue, element, propsSubscription);
    }
};
const isEventHandler = (propName) => propName.startsWith('on');
const isRxEventHandler = (propName, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_) => propName.endsWith('$');
const connectEventProp = (rvdElement, element, propsSubscription) => (propName, propValue) => {
    if (isEventHandler(propName)) {
        if (isRxEventHandler(propName)) {
            const classicHandlerName = propName.substr(0, propName.length - 1);
            const eventName = classicHandlerName.slice(2).toLocaleLowerCase();
            const event$ = map(event => Object.assign({ element }, event))(fromEvent(element, eventName));
            propsSubscription.add(propValue(event$).subscribe(event => {
                if (rvdElement.props[classicHandlerName]) {
                    rvdElement.props[classicHandlerName](event);
                }
            }));
        }
        else {
            if (rvdElement.props[`${propName}$`]) {
                return;
            }
            const eventName = propName.slice(2).toLocaleLowerCase();
            const event$ = map(event => Object.assign({ element }, event))(fromEvent(element, eventName));
            propsSubscription.add(event$.subscribe(event => propValue(event)));
        }
    }
};
const connectDOMProp = (rvdElement, element) => (propName, propValue) => {
    const name = propName === 'class' ? 'className' : propName;
    if (name === 'className') {
        if (isNullOrUndef(propValue)) {
            element.className = '';
        }
        else {
            element.className = String(propValue);
        }
    }
    else {
        if (isNullOrUndef(propValue)) {
            element.removeAttribute(name);
        }
        else if (isBoolean(propValue)) {
            if (propValue) {
                element.setAttribute(name, name);
            }
            else {
                element.removeAttribute(name);
            }
        }
        else {
            element.setAttribute(name, String(propValue));
        }
    }
};
const connectObservableProp = (rvdElement, element, propsSubscription) => (propName, observableProp) => {
    propsSubscription.add(observableProp.subscribe(propValue => {
        connectDOMProp(rvdElement, element)(propName, propValue);
    }));
};
const isSpecialProp = (propName) => propName === 'children' || propName === 'key' || propName === 'ref';
const isStyleProp = (propName, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_) => propName === 'style';
const connectProp = (styleCallback, eventCallback, observableCallback, staticCallback) => ([propName, propValue]) => {
    if (isSpecialProp(propName))
        return;
    if (isStyleProp(propName))
        return styleCallback(propName, propValue);
    if (isFunction(propValue))
        return eventCallback(propName, propValue);
    if (isObservable(propValue))
        return observableCallback(propName, propValue);
    return staticCallback(propName, propValue);
};
/**
 * Connecting element props - just set static props and subscribe to observable props
 * @param rvdElement
 * @param element
 */
function connectElementProps(rvdElement, element) {
    const propsSubscription = new Subscription();
    if (rvdElement.props) {
        Object.entries(rvdElement.props).forEach(connectProp(connectStyleProp(rvdElement, element, propsSubscription), connectEventProp(rvdElement, element, propsSubscription), connectObservableProp(rvdElement, element, propsSubscription), connectDOMProp(rvdElement, element)));
    }
    return propsSubscription;
}

function unsubscribe(withSub) {
    if (withSub.subscription) {
        withSub.subscription.unsubscribe();
    }
}

const childrenArrayToFragment = (children) => ({
    props: null,
    type: '_Fragment',
    children
});
const getFlattenFragmentChildren = (createdChildren, onlyIndexes = false) => (all, index) => {
    const child = createdChildren.get(index) || createdChildren.getFragment(index);
    return child.fragmentChildIndexes ?
        all.concat(child.fragmentChildIndexes.reduce(getFlattenFragmentChildren(createdChildren, onlyIndexes), [])) : all.concat(onlyIndexes ? child.index : child);
};

function renderChildInIndexPosition(successCallback, childElement, childIndex, parentElement, createdChildren) {
    // --------------------------------------------------------------------------------------------
    // Easiest case - add as first added child
    if (createdChildren.empty()) {
        appendChild(parentElement, childElement);
        // --------------------------------------------------------------------------------------------
        // Also easy case - add as second added child
    }
    else if (createdChildren.hasOneChild()) {
        const existingChildIndex = createdChildren.getFirstIndex();
        // If new child has higher index than existing child, append it as last element
        if (parseInt(childIndex) > parseInt(existingChildIndex)) {
            appendChild(parentElement, childElement);
            // Else - if new child has lower childIndex than existing child, prepend it as first element
        }
        else {
            const existingChild = createdChildren.getFirstChild();
            insertBefore(parentElement, childElement, existingChild.element);
        }
        // --------------------------------------------------------------------------------------------
        // More complicated case, there is more than one existing child currently connected to parent.
    }
    else {
        // To know the exact position, where new child should be inserted, we are sorting array
        // of existing children and new child indexes (indexes can be nested structures, sorting
        // have to be recursive)
        const { isFirst, isLast, nextSibling, firstChild } = createdChildren.getPositionInfoForNewChild(childIndex);
        // ------------------------------------------------------------------------------------------
        // If new child is first in sorted indexes, insert it as first child of parent Element
        if (isFirst) {
            insertBefore(parentElement, childElement, firstChild.element);
            // ------------------------------------------------------------------------------------------
            // If new child is last in sorted indexes, insert it as last child of parent Element
        }
        else if (isLast) {
            appendChild(parentElement, childElement);
            // ------------------------------------------------------------------------------------------
            // Otherwise, just get next sibling (it's just next child index in array)
            // and insert new element before it
        }
        else {
            insertBefore(parentElement, childElement, nextSibling.element);
        }
    }
    return successCallback({ index: childIndex, element: childElement });
}
function replaceChildOnIndexPosition(successCallback, childElement, childIndex, parentElement, createdChildren) {
    const existingElement = createdChildren.get(childIndex);
    if (replaceChild(parentElement, childElement, existingElement.element)) {
        return successCallback({ index: childIndex, element: childElement });
    }
}
function removeChildFromIndexPosition(successCallback, childIndex, parentElement, createdChildren) {
    const child = createdChildren.get(childIndex);
    if (removeChild(parentElement, child.element)) {
        return successCallback(child);
    }
}

/**
 * Utility class for keeping the order of rendered element children.
 * Class is internal for the ES Module, for external usage factory
 * function is exported and for typings {@link CreatedChildrenManager}
 * interface should be used
 */
class ChildrenManager {
    constructor() {
        /**
         * Get iterator for Children Map
         */
        this[Symbol.iterator] = () => {
            return this.toEntriesArray()[Symbol.iterator]();
        };
        this.indexes = [];
        this.children = {};
        this.fragmentIndexes = [];
        this.fragmentChildren = {};
        this.has = (key) => !!this.children[key];
        this.get = (key) => this.children[key];
        this.hasFragment = (key) => !!this.fragmentChildren[key];
        this.getFragment = (key) => this.fragmentChildren[key];
        this.setFnFactory = (mode, isFragment = false) => (key, value) => {
            try {
                const isAddMode = mode === 'add';
                const hasKey = isFragment ? !!this.fragmentChildren[key] : !!this.children[key];
                const shouldSet = isAddMode ? !hasKey : hasKey;
                if (shouldSet) {
                    if (isFragment) {
                        if (isAddMode)
                            this.fragmentIndexes = this.fragmentIndexes.concat(key);
                        this.fragmentChildren[key] = value;
                    }
                    else {
                        if (isAddMode)
                            this.indexes = this.indexes.concat(key);
                        this.children[key] = value;
                    }
                    return true;
                }
                return false;
            }
            catch (e) {
                return false;
            }
        };
        this.add = this.setFnFactory('add');
        this.replace = this.setFnFactory('replace');
        this.addFragment = this.setFnFactory('add', true);
        this.replaceFragment = this.setFnFactory('replace', true);
        this.createEmptyFragment = (index) => this.addFragment(index, {
            index,
            element: _FRAGMENT,
            fragmentChildIndexes: [],
            fragmentChildKeys: {},
            fragmentChildrenLength: 0
        });
        this.remove = (key) => this.has(key) && this.delete(key);
        this.removeFragment = (key) => this.hasFragment(key) && this.delete(key, true);
        this.size = () => this.indexes.length;
        this.empty = () => this.indexes.length === 0;
        this.getAll = () => this.indexes.map(index => this.children[index]);
        this.getKeys = () => this.indexes;
        this.removeAll = () => {
            this.indexes = [];
            this.children = {};
            return true;
        };
        this.toEntriesArray = () => this.indexes.map(this.mapToEntry);
        this.getFirstIndex = () => this.indexes[0];
        this.getFirstChild = () => this.children[this.indexes[0]];
        this.hasOneChild = () => this.indexes.length === 1;
        this.delete = (key, isFragment = false) => {
            try {
                if (isFragment) {
                    this.fragmentIndexes = this.fragmentIndexes.filter(index => index !== key);
                    delete this.fragmentChildren[key];
                }
                else {
                    this.indexes = this.indexes.filter(index => index !== key);
                    delete this.children[key];
                }
                return true;
            }
            catch (e) {
                return false;
            }
        };
        this.mapToEntry = (index) => ([index, this.children[index]]);
        this.getChildOrNull = (exists, getSiblingIndex) => {
            if (!exists) {
                return null;
            }
            return this.children[getSiblingIndex()];
        };
        this.getPositionInfoForNewChild = (index) => {
            const allSortedIndexes = ChildrenManager.sortIndexes(this.indexes.concat(index));
            const indexInArray = allSortedIndexes.indexOf(index);
            const isFirst = isIndexFirstInArray(indexInArray);
            const isLast = isIndexLastInArray(indexInArray, allSortedIndexes);
            const firstChild = this.getChildOrNull(!isFirst, () => allSortedIndexes[0]);
            const previousSibling = this.getChildOrNull(!isFirst, () => allSortedIndexes[indexInArray - 1]);
            const nextSibling = this.getChildOrNull(!isLast, () => allSortedIndexes[indexInArray + 1]);
            return {
                indexInArray,
                allSortedIndexes,
                isFirst,
                isLast,
                previousSibling,
                nextSibling,
                firstChild
            };
        };
    }
    /**
     * Object.prototype.toString() implementation
     */
    get [Symbol.toStringTag]() {
        return JSON.stringify(this.indexes);
    }
}
ChildrenManager.sortIndexes = (indexes) => sortNestedIndexes(indexes);
const getSortedFragmentChildIndexes = (fragment) => ChildrenManager.sortIndexes(fragment.fragmentChildIndexes);
/**
 * @func createdChildrenManager
 */
var createChildrenManager = () => (new ChildrenManager());

const textRenderCallback = (childIndex, element, createdChildren) => (child) => {
    const renderTextCallback = () => {
        renderChildInIndexPosition(newChild => createdChildren.add(childIndex, newChild), createTextNode(String(child)), childIndex, element, createdChildren);
    };
    renderTypeSwitch(existingChild => {
        replaceChildOnIndexPosition(newChild => {
            unsubscribe(existingChild);
            createdChildren.replace(childIndex, newChild);
        }, createTextNode(String(child)), childIndex, element, createdChildren);
    }, existingFragment => {
        getSortedFragmentChildIndexes(existingFragment).forEach(fragmentChildIndex => {
            removeChildFromIndexPosition(removedChild => {
                unsubscribe(removedChild);
                createdChildren.remove(fragmentChildIndex);
            }, fragmentChildIndex, element, createdChildren);
        });
        unsubscribe(existingFragment);
        createdChildren.removeFragment(childIndex);
        renderTextCallback();
    }, renderTextCallback)(childIndex, createdChildren);
};
const staticTextRenderCallback = (childIndex, element, createdChildren) => (child) => {
    renderChildInIndexPosition(newChild => createdChildren.add(childIndex, newChild), createTextNode(String(child)), childIndex, element, createdChildren);
};

const nullRenderCallback = (childIndex, element, createdChildren) => () => {
};

const replaceElementForElement = (elementNode, childIndex, element, createdChildren, childrenSubscription) => (existingChild) => {
    const childElementSubscription = elementNode.elementSubscription;
    if (childElementSubscription) {
        childrenSubscription.add(childElementSubscription);
    }
    replaceChildOnIndexPosition(newChild => {
        unsubscribe(existingChild);
        createdChildren.add(childIndex, {
            ...newChild,
            subscription: childElementSubscription
        });
    }, elementNode.dom, childIndex, element, createdChildren);
};
const replaceFragmentForElement = (renderFn, elementNode, childIndex, element, createdChildren) => (existingFragment) => {
    existingFragment.fragmentChildIndexes
        .reduce(getFlattenFragmentChildren(createdChildren, true), [])
        .forEach((fragmentChildIndex) => {
        removeChildFromIndexPosition(removedChild => {
            unsubscribe(removedChild);
            createdChildren.remove(fragmentChildIndex);
        }, fragmentChildIndex, element, createdChildren);
    });
    unsubscribe(existingFragment);
    createdChildren.removeFragment(childIndex);
    renderFn();
};
const renderElement = (elementNode, childIndex, element, createdChildren, childrenSubscription) => () => {
    const childElementSubscription = elementNode.elementSubscription;
    if (childElementSubscription) {
        childrenSubscription.add(childElementSubscription);
    }
    renderChildInIndexPosition(newChild => createdChildren.add(childIndex, {
        ...newChild,
        subscription: childElementSubscription
    }), elementNode.dom, childIndex, element, createdChildren);
};

const removeExistingFragment = (oldKeyElementMap, childIndex, element, createdChildren) => (existingFragment) => {
    existingFragment.fragmentChildIndexes
        .reduce(getFlattenFragmentChildren(createdChildren, true), [])
        .forEach((fragmentChildIndex) => {
        removeChildFromIndexPosition(removedChild => {
            if (!existingFragment.key || !oldKeyElementMap[existingFragment.key]) {
                unsubscribe(removedChild);
            }
            createdChildren.remove(fragmentChildIndex);
        }, fragmentChildIndex, element, createdChildren);
    });
    if (!existingFragment.key || !oldKeyElementMap[existingFragment.key]) {
        unsubscribe(existingFragment);
    }
    createdChildren.removeFragment(childIndex);
};

const render = (child, currentKeyedElement, oldKeyElementMap, createdFragment, childIndex, element, createdChildren) => () => {
    const childIndexPartsLength = childIndex.split('.').length;
    currentKeyedElement.fragmentChildren.forEach(fragmentChild => {
        const fragmentChildIndexRest = fragmentChild.index
            .split('.')
            .slice(childIndexPartsLength)
            .join('.');
        const fragmentChildIndex = `${childIndex}.${fragmentChildIndexRest}`;
        renderChildInIndexPosition(newChild => {
            createdChildren.add(fragmentChildIndex, {
                ...newChild,
                key: fragmentChild.key,
                subscription: fragmentChild.subscription
            });
            if (createdChildren.has(fragmentChild.index)) {
                createdChildren.remove(fragmentChild.index);
            }
        }, fragmentChild.element, fragmentChildIndex, element, createdChildren);
    });
    createdFragment.fragmentChildKeys = {
        ...createdFragment.fragmentChildKeys,
        [child.key]: childIndex
    };
    delete oldKeyElementMap[child.key];
};
const nestedFragmentMoveCallback = (child, currentKeyedElement, oldKeyElementMap, createdFragment, childIndex, element, createdChildren) => {
    return renderTypeSwitch(() => {
        removeChildFromIndexPosition(removedChild => {
            createdChildren.remove(removedChild.index);
            if (!removedChild.key || !oldKeyElementMap[removedChild.key]) {
                unsubscribe(removedChild);
            }
        }, childIndex, element, createdChildren);
        render(child, currentKeyedElement, oldKeyElementMap, createdFragment, childIndex, element, createdChildren)();
    }, existingFragment => {
        removeExistingFragment(oldKeyElementMap, childIndex, element, createdChildren)(existingFragment);
        render(child, currentKeyedElement, oldKeyElementMap, createdFragment, childIndex, element, createdChildren)();
    }, render(child, currentKeyedElement, oldKeyElementMap, createdFragment, childIndex, element, createdChildren))(childIndex, createdChildren);
};

const render$1 = (child, currentKeyedElement, oldKeyElementMap, createdFragment, childIndex, element, createdChildren) => {
    renderChildInIndexPosition(newChild => {
        createdChildren.add(childIndex, {
            ...newChild,
            key: child.key,
            subscription: currentKeyedElement.child.subscription
        });
        createdFragment.fragmentChildKeys = {
            ...createdFragment.fragmentChildKeys,
            [child.key]: childIndex
        };
        delete oldKeyElementMap[child.key];
    }, currentKeyedElement.child.element, childIndex, element, createdChildren);
};
const elementMoveCallback = (child, currentKeyedElement, oldKeyElementMap, createdFragment, childIndex, element, createdChildren) => {
    return renderTypeSwitch(existingChild => {
        replaceChildOnIndexPosition(newChild => {
            if (!existingChild.key || !oldKeyElementMap[existingChild.key]) {
                unsubscribe(existingChild);
            }
            createdChildren.replace(childIndex, {
                ...newChild,
                key: child.key,
                subscription: currentKeyedElement.child.subscription
            });
            createdFragment.fragmentChildKeys = {
                ...createdFragment.fragmentChildKeys,
                [child.key]: childIndex
            };
            delete oldKeyElementMap[child.key];
        }, currentKeyedElement.child.element, childIndex, element, createdChildren);
    }, existingFragment => {
        removeExistingFragment(oldKeyElementMap, childIndex, element, createdChildren)(existingFragment);
        render$1(child, currentKeyedElement, oldKeyElementMap, createdFragment, childIndex, element, createdChildren);
    }, () => render$1(child, currentKeyedElement, oldKeyElementMap, createdFragment, childIndex, element, createdChildren))(childIndex, createdChildren);
};

/**
 * Check type of fragment child and if child has a key and call different action:
 * - if child has key, call keyedCallback (which will skip rendering, move or renderer
 *   keyed child)
 * - if has not key, call nonKeyedCallback (which will call standard logic for rendering
 *   observable child - even if it's static child - that's specific case for fragments
 *   and arrays, as elements can change, then it cannot just renderer child in it's
 *   position, but also check and remove/replace existing element on child's position)
 * @param fragmentIndex
 * @param childrenSubscription
 * @param keyedCallback
 * @param nonKeyedCallback
 */
const renderFragmentChild = (fragmentIndex, childrenSubscription, keyedCallback, nonKeyedCallback) => (child, index) => {
    const childIndex = `${fragmentIndex}.${index}`;
    if (isObservable(child)) {
        const childSub = child.subscribe(observableChild => {
            if (isRvdElement(observableChild) && observableChild.key) {
                keyedCallback(observableChild, childIndex);
            }
            else {
                nonKeyedCallback(observableChild, childIndex);
            }
        });
        childrenSubscription.add(childSub);
    }
    else {
        if (isRvdElement(child) && child.key) {
            keyedCallback(child, childIndex);
        }
        else {
            nonKeyedCallback(child, childIndex);
        }
    }
};
/**
 * Skip rendering keyed child - function is called, when child with the same key
 * appears in the same position - just adding child's key - index entry to created
 * fragment's fragmentChildKeys dictionary
 * @param oldKeyElementMap
 * @param createdFragment
 * @param childIndex
 * @param key
 */
const skipRenderingKeyedChild = (oldKeyElementMap, createdFragment, childIndex, key) => {
    createdFragment.fragmentChildKeys = {
        ...createdFragment.fragmentChildKeys,
        [key]: childIndex
    };
    delete oldKeyElementMap[key];
    console.log('Skip rendering element with key: ', key);
};
const hasRemainingKeyedElements = (createdFragment) => createdFragment.oldKeyElementMap && Object.keys(createdFragment.oldKeyElementMap).length > 0;
/**
 * Called when new fragment (or array) appears in place of existing fragment. Load
 * references to currently rendered elements with keys from existing fragment. They
 * will be used later for skipping rendering or moving element to other place
 * instead of re-rendering whole fragment (or array)
 * @param createdChildren
 * @param createdFragment
 */
const loadPreviousKeyedElements = (createdChildren, createdFragment) => {
    if (hasRemainingKeyedElements(createdFragment)) {
        Object.values(createdFragment.oldKeyElementMap).forEach((oldKeyedChild) => {
            if (oldKeyedChild.fragmentChildren) {
                oldKeyedChild.fragmentChildren.forEach(fragmentChild => unsubscribe(fragmentChild));
            }
            unsubscribe(oldKeyedChild.child);
        });
    }
    createdFragment.oldKeyElementMap = Object.keys(createdFragment.fragmentChildKeys)
        .reduce((newMap, key) => {
        const index = createdFragment.fragmentChildKeys[key];
        const child = createdChildren.get(index) || createdChildren.getFragment(index);
        const fragmentChildren = child.fragmentChildIndexes &&
            child.fragmentChildIndexes.reduce(getFlattenFragmentChildren(createdChildren), []);
        newMap[key] = {
            index,
            child,
            fragmentChildren
        };
        return newMap;
    }, {});
    return createdFragment.oldKeyElementMap;
};
/**
 * Check if element with the same key as new child is in oldKeyElementMap. If yes, it means
 * that it is currently rendered in DOM and should be skipped if it's on the same position
 * or moved if it's position is changed, instead of re-creating element. If element wasn't
 * rendered, call renderNewCallback - standard rendering logic
 * @param oldKeyElementMap
 * @param createdFragment
 * @param element
 * @param createdChildren
 * @param renderNewCallback
 */
const skipMoveOrRenderKeyedChild = (oldKeyElementMap, createdFragment, element, createdChildren, renderNewCallback) => (child, childIndex) => {
    const currentKeyedElement = oldKeyElementMap[child.key];
    if (currentKeyedElement) {
        // Same element, on the same position
        if (currentKeyedElement.index === childIndex) {
            return skipRenderingKeyedChild(oldKeyElementMap, createdFragment, childIndex, child.key);
        }
        else {
            // Move fragment child (nested)
            if (currentKeyedElement.child.element === _FRAGMENT) {
                nestedFragmentMoveCallback(child, currentKeyedElement, oldKeyElementMap, createdFragment, childIndex, element, createdChildren);
            }
            else {
                elementMoveCallback(child, currentKeyedElement, oldKeyElementMap, createdFragment, childIndex, element, createdChildren);
            }
            console.log('Move child with key: ', child.key);
        }
    }
    else {
        createdFragment.fragmentChildKeys = {
            ...createdFragment.fragmentChildKeys,
            [child.key]: childIndex
        };
        console.log('Render child with key: ', child.key);
        renderNewCallback(child, childIndex);
    }
};

const removeExcessiveChildren = (fragmentIndex, element, createdChildren, rvdFragmentElement, oldKeyElementMap, createdFragment) => {
    const previousChildrenLength = createdFragment.fragmentChildrenLength;
    const newChildrenLength = rvdFragmentElement.children.length;
    if (previousChildrenLength > newChildrenLength) {
        const toRemoveCount = previousChildrenLength - newChildrenLength;
        Array.from({ length: toRemoveCount }, (_, i) => i + newChildrenLength).forEach(index => {
            const childIndex = `${fragmentIndex}.${index}`;
            if (createdChildren.has(childIndex)) {
                removeChildFromIndexPosition(removedChild => {
                    if (!removedChild.key || !oldKeyElementMap[removedChild.key]) {
                        unsubscribe(removedChild);
                    }
                    createdChildren.remove(removedChild.index);
                }, childIndex, element, createdChildren);
            }
            else if (createdChildren.hasFragment(childIndex)) {
                removeExistingFragment(oldKeyElementMap, childIndex, element, createdChildren)(createdChildren.getFragment(childIndex));
            }
        });
    }
};
function renderRvdFragment(fragmentIndex, element, createdChildren, childrenSubscription, renderNewCallback) {
    return (rvdFragmentElement) => {
        const createdFragment = createdChildren.getFragment(fragmentIndex);
        const oldKeyElementMap = loadPreviousKeyedElements(createdChildren, createdFragment);
        createdFragment.fragmentChildKeys = {};
        removeExcessiveChildren(fragmentIndex, element, createdChildren, rvdFragmentElement, oldKeyElementMap, createdFragment);
        rvdFragmentElement.children.forEach(renderFragmentChild(fragmentIndex, childrenSubscription, skipMoveOrRenderKeyedChild(oldKeyElementMap, createdFragment, element, createdChildren, renderNewCallback), renderNewCallback));
    };
}

const replaceElementForFragment = (child, childIndex, element, createdChildren, childrenSubscription, renderNewCallback) => () => {
    removeChildFromIndexPosition(removedChild => {
        unsubscribe(removedChild);
        createdChildren.remove(removedChild.index);
        createdChildren.createEmptyFragment(childIndex);
        return renderRvdFragment(childIndex, element, createdChildren, childrenSubscription, renderNewCallback)(child);
    }, childIndex, element, createdChildren);
};
const replaceFragmentForFragment = (child, childIndex, element, createdChildren, childrenSubscription, renderNewCallback) => () => {
    return renderRvdFragment(childIndex, element, createdChildren, childrenSubscription, renderNewCallback)(child);
};
const renderFragment = (child, childIndex, element, createdChildren, childrenSubscription, renderNewCallback) => () => {
    createdChildren.createEmptyFragment(childIndex);
    return renderRvdFragment(childIndex, element, createdChildren, childrenSubscription, renderNewCallback)(child);
};
const fragmentRenderCallback = (childIndex, element, createdChildren, childrenSubscription, renderNewCallback) => (child) => {
    renderTypeSwitch(replaceElementForFragment(child, childIndex, element, createdChildren, childrenSubscription, renderNewCallback), replaceFragmentForFragment(child, childIndex, element, createdChildren, childrenSubscription, renderNewCallback), renderFragment(child, childIndex, element, createdChildren, childrenSubscription, renderNewCallback))(childIndex, createdChildren);
};
const staticFragmentRenderCallback = (childIndex, element, createdChildren, childrenSubscription, renderNewCallback) => (child) => {
    createdChildren.createEmptyFragment(childIndex);
    return renderRvdFragment(childIndex, element, createdChildren, childrenSubscription, renderNewCallback)(child);
};
const arrayRenderCallback = (...args) => (child) => fragmentRenderCallback(...args)(childrenArrayToFragment(child));
const staticArrayRenderCallback = (...args) => (child) => staticFragmentRenderCallback(...args)(childrenArrayToFragment(child));

const getComponentProps = (rvdComponent) => {
    const componentProps = rvdComponent.props;
    if (rvdComponent.children) {
        componentProps.children = rvdComponent.children;
    }
    return componentProps;
};
const createComponent = (rvdComponent) => {
    console.log('COMPONENT DEBUG: ', rvdComponent);
    return rvdComponent._component(getComponentProps(rvdComponent));
};
const getChildWithParsedKeys = (child, componentKey) => {
    if (componentKey && isRvdElement(child)) {
        if (child.key) {
            if (child.key !== componentKey) {
                child.key = `${componentKey}.${child.key}`;
            }
        }
        else {
            child.key = componentKey;
        }
    }
    return child;
};
/**
 * Render Rvd Component and attach returned child(ren) to parent element
 * @param componentIndex
 * @param element
 * @param createdChildren
 * @param childrenSubscription
 * @param renderNewCallback
 */
function renderRvdComponent(componentIndex, element, createdChildren, childrenSubscription, renderNewCallback) {
    return (rvdComponentElement) => {
        const componentChild = createComponent(rvdComponentElement);
        console.log('COMPONENT CHILD DEBUG: ', componentChild);
        const key = rvdComponentElement.key || null;
        if (isObservable(componentChild)) {
            const componentChildSub = componentChild.subscribe(observableChild => renderNewCallback(getChildWithParsedKeys(observableChild, key), componentIndex));
            childrenSubscription.add(componentChildSub);
        }
        else {
            return renderNewCallback(getChildWithParsedKeys(componentChild, key), componentIndex);
        }
    };
}

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

const createState = (initialState) => {
    const stateSubject = new BehaviorSubject(initialState);
    const state$ = stateSubject.asObservable();
    const nextState = valueOrCallback => {
        if (isFunction(valueOrCallback)) {
            first()(state$).subscribe(valueOrCallback);
        }
        else {
            stateSubject.next(valueOrCallback);
        }
    };
    return [state$, nextState];
};

/**
 * Create state subject
 * eventState is returning connectEvent, as a second element - the function
 * that's connecting state and event (for certain element) - then state
 * value are computed from incoming events. One state field could be connected
 * to multiple events.
 *
 * eventState is taking an operator (that could be piped before) - it's used to compute
 * state value from events - for all connected events. Additionally connectEvent is
 * also taking an (pre-)operator, called per one concrete event, before calling operator for
 * all events - it's enabling connecting different types of events.
 *
 * @param operator
 */
const eventState = (operator) => {
    /**
     * Replay subject - as it's state, it's good (for most cases), to push last state value
     * to new observers.
     */
    const stateSubject = new ReplaySubject(1);
    const state$ = stateSubject.asObservable();
    /**
     * Connect event with state
     * Have to be passed to Reactive Event Handler props
     * @param preOperator
     */
    const connectEvent = preOperator => (event$) => {
        const source$ = operator
            ? preOperator
                ? operator(preOperator(event$))
                : operator(event$)
            : preOperator
                ? preOperator(event$)
                : event$;
        return pipe(tap(stateSubject.next), catchError(error => {
            stateSubject.next(error);
            return throwError(() => error);
        }))(source$);
    };
    return [state$, connectEvent];
};

export { createState, eventState, createRvDOM as iQRvdStart, createState as useState };
