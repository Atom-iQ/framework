import {fromEvent, isObservable, Subscription} from 'rxjs';
import {
  rxDom,
  isFunction,
  isString,
  isStringOrNumber,
  RxSub,
  isIndexFirstInArray,
  isIndexLastInArray
} from 'rx-ui-shared';
import {CreatedChild, CreatedChildren, RxConnectedDOM} from '../types';
import {
  after,
  append,
  prepend
} from '../../_utils/dom';


export function isElementNode(
  rxNode: rxDom.RxNode<RxProps>
): boolean {
  return isString(rxNode.type) && rxNode.type !== '_Fragment';
}

export function connectElementProps(
  rxNode: rxDom.RxNode<RxProps>,
  element: Element
): RxSub {
  const propsSubscription = new Subscription();
  if (rxNode.props) {
    Object.keys(rxNode.props).forEach(propName => {
      const prop = rxNode.props[propName];
      if (isObservable(prop)) {
        const attrSub = prop.subscribe(propValue => {
          element.setAttribute(propName, String(propValue));
        });
        propsSubscription.add(attrSub);
      } else if (isFunction(prop)) {
        if (propName.startsWith('on')) {
          const eventName = propName.slice(2).toLocaleLowerCase();
          const eventSub = fromEvent(element, eventName)
            .subscribe(event => prop(event));
          propsSubscription.add(eventSub);
        }
      } else if (isStringOrNumber(prop)) {
        element.setAttribute(propName, String(prop));
      }
    });
  }
  return propsSubscription;
}

const hasSingleChild: (children: CreatedChildren) => boolean =
  children => Object.keys(children).length === 1;
const getSingleChild: (children: CreatedChildren) => CreatedChild =
  children => children[Object.keys(children)[0]];
const hasNotChildren: (children: CreatedChildren) => boolean =
  children => Object.keys(children).length === 0;

export function renderChildInIndexPosition(
  childElement: Element | Text,
  index: string,
  parentElement: Element,
  existingFlatChildren: CreatedChildren
): CreatedChildren {
  const newChildren = { [index]: { index, element: childElement } };
  // --------------------------------------------------------------------------------------------
  // Easiest case - add as first added child
  if (hasNotChildren(existingFlatChildren)) {
    append(parentElement, childElement);
    // --------------------------------------------------------------------------------------------
    // Also easy case - add as second added child
  } else if (hasSingleChild(existingFlatChildren)) {
    const existingChild = getSingleChild(existingFlatChildren);
    // If new child has higher index than existing child, append it as last element
    if (parseInt(index) > parseInt(existingChild.index)) {
      append(parentElement, childElement);
      // Else - if new child has lower index than existing child, prepend it as first element
    } else {
      prepend(parentElement, childElement);
    }
    // --------------------------------------------------------------------------------------------
    // More complicated case, there is more than one existing child currently connected to parent.
  } else {
    // To know the exact position, where new child should be inserted, we are sorting array
    // of existing children and new child indexes (indexes can be nested structures, sorting
    // have to be recursive)
    const sortedAllChildrenIndexes: string[] = Object.keys({
      ...existingFlatChildren,
      ...newChildren
    }).sort(sortFlatChildrenKeys);

    // Then we are getting position of new child index in array of sorted indexes
    const newChildArrayIndex = sortedAllChildrenIndexes.findIndex(
      key => index === key
    );
      // ------------------------------------------------------------------------------------------
      // If new child index is first in sorted indexes, insert it as first child of parent Element
    if (isIndexFirstInArray(newChildArrayIndex)) {
      prepend(parentElement, childElement);
      // ------------------------------------------------------------------------------------------
      // If new child index is last in sorted indexes, insert it as last child of parent Element
    } else if (isIndexLastInArray(newChildArrayIndex, sortedAllChildrenIndexes)) {
      append(parentElement, childElement);
      // ------------------------------------------------------------------------------------------
      // Otherwise, just get previous sibling (it's just previous child index in array)
      // and insert new element after it
    } else {
      const previousSiblingIndex = sortedAllChildrenIndexes[newChildArrayIndex - 1];
      const previousSibling = existingFlatChildren[previousSiblingIndex];
      after(
        previousSibling.element,
        childElement
      );
    }
  }

  return {
    ...existingFlatChildren,
    ...newChildren
  };
}


export function removeChildrenFromIndexPosition(
  index: string,
  existingChildren: CreatedChildren
): CreatedChildren {


  return existingChildren;
}

export function renderElementFromComponent(
  childElementSubscriptions: { [index: string]: RxSub | null },
  index: number,
  connectedDOM: RxConnectedDOM,
  elementSubscription: RxSub,
  element: Element | SVGElement,
  createdChildrenMap: CreatedChildren,
  renderFragmentSubscriptions: { [index: string]: RxSub | null }
): CreatedChildren {
  const wasFragmentRendered = () => {
    if (createdChildrenMap[String(index)]) {
      return false;
    }
    return !!Object.keys(createdChildrenMap).find(childIndex => childIndex.startsWith(`${index}.`));
  };

  if (wasFragmentRendered()) {
    Object.keys(createdChildrenMap)
    // Change Regexp
      .filter(childIndex => childIndex.startsWith(`${index}.`))
      .sort(sortFlatChildrenKeys)
      .map(fragmentChildIndex => {
        if (childElementSubscriptions[fragmentChildIndex]) {
          childElementSubscriptions[fragmentChildIndex]!.unsubscribe();
          childElementSubscriptions[fragmentChildIndex] = null;
        }

        if (renderFragmentSubscriptions[fragmentChildIndex]) {
          renderFragmentSubscriptions[fragmentChildIndex]!.unsubscribe();
          renderFragmentSubscriptions[fragmentChildIndex] = null;
        }

        return fragmentChildIndex;
      }).forEach((fragmentChildIndex: string, index: number) => {
        const node = createdChildrenMap[fragmentChildIndex].element;
        if (index === 0) {
          if (connectedDOM.elementSubscription) {
            childElementSubscriptions[String(index)] = connectedDOM.elementSubscription;
            elementSubscription.add(childElementSubscriptions[String(index)]!);
          }

          node.replaceWith(connectedDOM.dom!);
        } else {
          node.remove();
        }
        delete createdChildrenMap[fragmentChildIndex];
      });

    return {
      ...createdChildrenMap,
      [String(index)]: {
        element: connectedDOM.dom,
        index: String(index)
      } as CreatedChild
    };
  } else if (createdChildrenMap[String(index)]) {

    if (childElementSubscriptions[String(index)]) {
      childElementSubscriptions[String(index)]!.unsubscribe();
      childElementSubscriptions[String(index)] = connectedDOM.elementSubscription;
      elementSubscription.add(childElementSubscriptions[String(index)]!);
    }
    const oldNode = createdChildrenMap[String(index)].element;
    oldNode.replaceWith(connectedDOM.dom!);
    return {
      ...createdChildrenMap,
      [String(index)]: {
        element: connectedDOM.dom,
        index: String(index)
      } as CreatedChild
    };

  } else {
    childElementSubscriptions[String(index)] = connectedDOM.elementSubscription;
    if (childElementSubscriptions[String(index)]) {
      elementSubscription.add(childElementSubscriptions[String(index)]!);
    }

    return renderChildInIndexPosition(
      connectedDOM.dom!,
      String(index),
      element,
      createdChildrenMap
    );
  }
}

function sortFlatChildrenKeys(a: string, b: string): number {
  const splittedA = a.split('.');
  const splittedB = b.split('.');
  if (splittedA.length > splittedB.length) {
    for (let i = 0; i < splittedB.length; i++) {
      const partToCheckA = Number(splittedA[i]);
      const partToCheckB = Number(splittedB[i]);
      if (partToCheckA !== partToCheckB) {
        return partToCheckA - partToCheckB;
      }
    }
  } else {
    for (let i = 0; i < splittedA.length; i++) {
      const partToCheckA = Number(splittedA[i]);
      const partToCheckB = Number(splittedB[i]);
      if (partToCheckA !== partToCheckB) {
        return partToCheckA - partToCheckB;
      }
    }
  }
  return 0;
}
