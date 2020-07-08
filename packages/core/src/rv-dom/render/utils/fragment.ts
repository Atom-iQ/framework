import {rxDom, isString, isNull, RxSub} from 'packages/rx-ui-shared';
import {CreatedChild, CreatedChildren, RxConnectedDOM} from '../types';
import {Observer} from 'rxjs';
import {renderChildInIndexPosition} from './element';

export function isFragmentNode(
  rxNode: rxDom.RxNode<RxProps>
): boolean {
  return isString(rxNode.type) && rxNode.type === '_Fragment';
}

export const passFragmentChildToParent: (
  connectedDom: RxConnectedDOM | null,
  observer: Observer<RxConnectedDOM>,
  index: number,
  childRenderSubscription: RxSub
) => void = (
  connectedDom: RxConnectedDOM | null,
  observer,
  index,
  childRenderSubscription
) => {
  if (isNull(connectedDom)) {
    observer.next({
      dom: null,
      elementSubscription: null,
      indexInFragment: String(index)
    });
  } else {
    if (connectedDom.fragmentRenderSubscription) {
      childRenderSubscription.add(connectedDom.fragmentRenderSubscription);
    }

    observer.next({
      dom: connectedDom.dom,
      elementSubscription: connectedDom.elementSubscription,
      indexInFragment: connectedDom.indexInFragment ?
        `${index}.${connectedDom.indexInFragment}` : String(index),
      fragmentRenderSubscription: childRenderSubscription
    });
  }
};

const replaceFragmentChildSubscriptions = (
  unsubscribePreviousSubscriptions: () => void,
  connectedDOM: RxConnectedDOM,
  index: number,
  childElementSubscriptions: { [index: string]: RxSub | null },
  elementSubscription: RxSub,
  renderFragmentSubscriptions?: { [index: string]: RxSub | null }
) => {
  unsubscribePreviousSubscriptions();

  const indexInFragment = `${index}.${connectedDOM.indexInFragment}`;

  if (connectedDOM.elementSubscription) {
    childElementSubscriptions[indexInFragment] =
      connectedDOM.elementSubscription;
    elementSubscription.add(
      childElementSubscriptions[indexInFragment]!
    );
  }

  if (renderFragmentSubscriptions) {
    if (renderFragmentSubscriptions[indexInFragment]) {
      renderFragmentSubscriptions[indexInFragment]!.unsubscribe();
    }
    if (connectedDOM.fragmentRenderSubscription) {
      renderFragmentSubscriptions[indexInFragment] =
        connectedDOM.fragmentRenderSubscription;
      elementSubscription.add(connectedDOM.fragmentRenderSubscription);
    }
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const renderChildFromFragment = (
  childElementSubscriptions: { [index: string]: RxSub | null },
  index: number,
  connectedDOM: RxConnectedDOM,
  elementSubscription: RxSub,
  element: Element | SVGElement,
  createdChildrenMap: CreatedChildren,
  renderFragmentSubscriptions?: { [index: string]: RxSub | null }
) => {
  if (createdChildrenMap[String(index)]) {

    replaceFragmentChildSubscriptions(
      () => {
        if (childElementSubscriptions[String(index)]) {
          childElementSubscriptions[String(index)]!.unsubscribe();
          childElementSubscriptions[String(index)] = null;
        }
      },
      connectedDOM,
      index,
      childElementSubscriptions,
      elementSubscription,
      renderFragmentSubscriptions
    );
    const oldNode = createdChildrenMap[String(index)].element;
    oldNode.replaceWith(connectedDOM.dom!);
    delete createdChildrenMap[String(index)];
    return {
      ...createdChildrenMap,
      [`${index}.${connectedDOM.indexInFragment}`]: {
        element: connectedDOM.dom,
        index: `${index}.${connectedDOM.indexInFragment}`
      } as CreatedChild
    };

  } else if (createdChildrenMap[`${index}.${connectedDOM.indexInFragment}`]) {
    const indexInFragment = `${index}.${connectedDOM.indexInFragment}`;
    replaceFragmentChildSubscriptions(
      () => {
        if (childElementSubscriptions[indexInFragment]) {
          childElementSubscriptions[indexInFragment]!.unsubscribe();
        }
      },
      connectedDOM,
      index,
      childElementSubscriptions,
      elementSubscription,
      renderFragmentSubscriptions
    );

    const oldNode = createdChildrenMap[indexInFragment].element;
    oldNode.replaceWith(connectedDOM.dom!);
    return {
      ...createdChildrenMap,
      [`${index}.${connectedDOM.indexInFragment}`]: {
        element: connectedDOM.dom,
        index: `${index}.${connectedDOM.indexInFragment}`
      } as CreatedChild
    };
  } else {
    if (connectedDOM.elementSubscription) {
      childElementSubscriptions[`${index}.${connectedDOM.indexInFragment}`] =
        connectedDOM.elementSubscription;
      elementSubscription.add(
        childElementSubscriptions[`${index}.${connectedDOM.indexInFragment}`]!
      );
    }

    if (connectedDOM.fragmentRenderSubscription) {
      if (renderFragmentSubscriptions) {
        renderFragmentSubscriptions[`${index}.${connectedDOM.indexInFragment}`] =
          connectedDOM.fragmentRenderSubscription;
      }

      elementSubscription.add(connectedDOM.fragmentRenderSubscription);
    }

    return renderChildInIndexPosition(
      connectedDOM.dom!,
      `${index}.${connectedDOM.indexInFragment}`,
      element,
      createdChildrenMap
    );
  }
};
