import { isObservable } from 'rxjs';
import { isRvdElement } from './utils/check-type.js';
import 'rxjs/operators';

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

export { renderRvdComponent };
