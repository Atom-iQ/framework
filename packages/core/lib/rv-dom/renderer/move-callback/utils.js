import 'rxjs';
import 'rxjs/operators';
import { unsubscribe } from '../utils/observable.js';
import { getFlattenFragmentChildren } from '../utils/fragment.js';
import { removeChildFromIndexPosition } from '../dom-renderer.js';

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

export { removeExistingFragment };
