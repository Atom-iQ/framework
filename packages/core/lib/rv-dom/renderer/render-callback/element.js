import 'rxjs';
import 'rxjs/operators';
import { unsubscribe } from '../utils/observable.js';
import { getFlattenFragmentChildren } from '../utils/fragment.js';
import { renderChildInIndexPosition, removeChildFromIndexPosition, replaceChildOnIndexPosition } from '../dom-renderer.js';

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

export { renderElement, replaceElementForElement, replaceFragmentForElement };
