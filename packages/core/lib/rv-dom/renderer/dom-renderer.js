import 'rxjs';
import { appendChild, insertBefore, replaceChild, removeChild } from './utils/dom.js';
import 'rxjs/operators';

function renderChildInIndexPosition(successCallback, childElement, childIndex, parentElement, createdChildren) {
    // --------------------------------------------------------------------------------------------
    // Easiest case - add as first added child
    if (createdChildren.empty()) {
        appendChild(parentElement, childElement);
        // --------------------------------------------------------------------------------------------
        // Also easy case - add as second added child
    }
    else if (createdChildren.hasOneChild()) {
        const existingChildIndex = createdChildren.getFirstIndex();
        // If new child has higher index than existing child, append it as last element
        if (parseInt(childIndex) > parseInt(existingChildIndex)) {
            appendChild(parentElement, childElement);
            // Else - if new child has lower childIndex than existing child, prepend it as first element
        }
        else {
            const existingChild = createdChildren.getFirstChild();
            insertBefore(parentElement, childElement, existingChild.element);
        }
        // --------------------------------------------------------------------------------------------
        // More complicated case, there is more than one existing child currently connected to parent.
    }
    else {
        // To know the exact position, where new child should be inserted, we are sorting array
        // of existing children and new child indexes (indexes can be nested structures, sorting
        // have to be recursive)
        const { isFirst, isLast, nextSibling, firstChild } = createdChildren.getPositionInfoForNewChild(childIndex);
        // ------------------------------------------------------------------------------------------
        // If new child is first in sorted indexes, insert it as first child of parent Element
        if (isFirst) {
            insertBefore(parentElement, childElement, firstChild.element);
            // ------------------------------------------------------------------------------------------
            // If new child is last in sorted indexes, insert it as last child of parent Element
        }
        else if (isLast) {
            appendChild(parentElement, childElement);
            // ------------------------------------------------------------------------------------------
            // Otherwise, just get next sibling (it's just next child index in array)
            // and insert new element before it
        }
        else {
            insertBefore(parentElement, childElement, nextSibling.element);
        }
    }
    return successCallback({ index: childIndex, element: childElement });
}
function replaceChildOnIndexPosition(successCallback, childElement, childIndex, parentElement, createdChildren) {
    const existingElement = createdChildren.get(childIndex);
    if (replaceChild(parentElement, childElement, existingElement.element)) {
        return successCallback({ index: childIndex, element: childElement });
    }
}
function removeChildFromIndexPosition(successCallback, childIndex, parentElement, createdChildren) {
    const child = createdChildren.get(childIndex);
    if (removeChild(parentElement, child.element)) {
        return successCallback(child);
    }
}

export { removeChildFromIndexPosition, renderChildInIndexPosition, replaceChildOnIndexPosition };
