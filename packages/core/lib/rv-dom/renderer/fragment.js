import 'rxjs';
import 'rxjs/operators';
import { unsubscribe } from './utils/observable.js';
import { removeChildFromIndexPosition } from './dom-renderer.js';
import { removeExistingFragment } from './move-callback/utils.js';
import { loadPreviousKeyedElements, renderFragmentChild, skipMoveOrRenderKeyedChild } from './fragment-children.js';

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

export { renderRvdFragment };
