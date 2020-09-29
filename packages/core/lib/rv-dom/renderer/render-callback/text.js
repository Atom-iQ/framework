import 'rxjs';
import { renderTypeSwitch } from '../utils/check-type.js';
import { createTextNode } from '../utils/dom.js';
import 'rxjs/operators';
import { unsubscribe } from '../utils/observable.js';
import { renderChildInIndexPosition, removeChildFromIndexPosition, replaceChildOnIndexPosition } from '../dom-renderer.js';
import { getSortedFragmentChildIndexes } from '../utils/children-manager.js';

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

export { staticTextRenderCallback, textRenderCallback };
