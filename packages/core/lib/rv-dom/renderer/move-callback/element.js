import 'rxjs';
import { renderTypeSwitch } from '../utils/check-type.js';
import 'rxjs/operators';
import { unsubscribe } from '../utils/observable.js';
import { replaceChildOnIndexPosition, renderChildInIndexPosition } from '../dom-renderer.js';
import { removeExistingFragment } from './utils.js';

const render = (child, currentKeyedElement, oldKeyElementMap, createdFragment, childIndex, element, createdChildren) => {
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
        render(child, currentKeyedElement, oldKeyElementMap, createdFragment, childIndex, element, createdChildren);
    }, () => render(child, currentKeyedElement, oldKeyElementMap, createdFragment, childIndex, element, createdChildren))(childIndex, createdChildren);
};

export { elementMoveCallback };
