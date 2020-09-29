import { isNullOrUndef, isBoolean, isStringOrNumber, isArray, isFunction, isString } from '../../../shared/utils/index.js';
import { SVGElementTypes } from '../../../shared/utils/elements.js';
import { _FRAGMENT } from '../../../shared/constants.js';

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

export { childTypeSwitch, isComponent, isElement, isFragment, isRvdElement, isSvgElement, renderTypeSwitch };
