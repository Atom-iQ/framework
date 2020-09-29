import 'rxjs';
import { renderTypeSwitch } from '../utils/check-type.js';
import 'rxjs/operators';
import { unsubscribe } from '../utils/observable.js';
import { childrenArrayToFragment } from '../utils/fragment.js';
import { removeChildFromIndexPosition } from '../dom-renderer.js';
import { renderRvdFragment } from '../fragment.js';

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

export { arrayRenderCallback, fragmentRenderCallback, staticArrayRenderCallback, staticFragmentRenderCallback };
