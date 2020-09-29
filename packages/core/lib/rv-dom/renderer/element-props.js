import { Subscription, isObservable, fromEvent } from 'rxjs';
import { isFunction, isNullOrUndef, isBoolean, isString } from '../../shared/utils/index.js';
import { map } from 'rxjs/operators';

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

export { connectElementProps };
