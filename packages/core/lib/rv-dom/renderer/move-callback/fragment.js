import 'rxjs';
import { renderTypeSwitch } from '../utils/check-type.js';
import 'rxjs/operators';
import { unsubscribe } from '../utils/observable.js';
import { renderChildInIndexPosition, removeChildFromIndexPosition } from '../dom-renderer.js';
import { removeExistingFragment } from './utils.js';

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

export { nestedFragmentMoveCallback };
