import {isObservable, Observable } from 'rxjs';
import {first} from 'rxjs/operators';

import {
  rxDom,
  rxComponent,
  isNull,
  isBoolean,
  isStringOrNumber,
  RxSub,
  RxO
} from 'rx-ui-shared';

import {CreatedChildren, RxConnectedDOM} from './types';
import {createDomElement, createTextNode, getRootDomElement} from '../_utils/dom';
import {coldObservable, nullObservable, switchMapChildNode} from './utils/common';
import {isComponentNode, renderComponent} from './utils/component';
import {
  connectElementProps,
  isElementNode,
  renderChildInIndexPosition,
  renderElementFromComponent
} from './utils/element';
import {isFragmentNode, passFragmentChildToParent, renderChildFromFragment} from './utils/fragment';

export function renderRxDom(
  rxNode: rxDom.RxNode<RxProps>
): RxO<RxConnectedDOM | null> {
  if (isComponentNode(rxNode)) {
    return renderRxComponent(rxNode);
  } else if (isFragmentNode(rxNode)) {
    return renderRxFragment(rxNode);
  } else {
    return renderRxElement(rxNode);
  }
}

function renderRxComponent(
  rxNode: rxDom.RxNode<RxProps>
): RxO<RxConnectedDOM | null> {
  const componentNode = renderComponent(rxNode);

  if (isNull(componentNode)) {
    return nullObservable();
  } else if (isObservable(componentNode)) {
    return componentNode.pipe(
      switchMapChildNode(renderRxDom)
    );
  } else {
    return renderRxDom(componentNode as rxDom.RxNode<RxProps>).pipe(first());
  }
}

function renderRxFragment(
  fragmentNode: rxDom.RxNode<RxProps>
): RxO<RxConnectedDOM> {
  return new Observable(observer => {
    fragmentNode.children!.forEach((child, index) => {
      if (isNull(child)) {
        observer.next({
          dom: null,
          elementSubscription: null,
          indexInFragment: String(index),
          _fragmentKey: fragmentNode._fragmentKey
        });
      // TODO: Add no-node object as available type for Text node
      // TODO: Check what happens when single child is array
      } else if (isStringOrNumber(child) || isBoolean(child)) {
        observer.next({
          dom: createTextNode(String(child)),
          elementSubscription: null,
          indexInFragment: String(index)
        });
      } else if (isRxNode(child as rxDom.RxNode<RxProps>)) {
        const childRenderSubscription = renderRxDom(child as rxDom.RxNode<RxProps>)
          .subscribe(connectedDOM => passFragmentChildToParent(
            connectedDOM,
            observer,
            index,
            childRenderSubscription
          ));
      } else if (isObservable(child)) {
        const childRenderSubscription = child.pipe(
          switchMapChildNode(renderRxDom)
        ).subscribe(connectedDOM => passFragmentChildToParent(
          connectedDOM,
          observer,
          index,
          childRenderSubscription
        ));
      }
    });
  });
}

function renderRxElement(
  rxNode: rxDom.RxNode<RxProps>
): RxO<RxConnectedDOM | null> {
  // TODO: Check for SVG Element
  const element = createDomElement(
    rxNode.type as string,
    false
  );
  // TODO: Connect Element Props Full Implementation
  const elementSubscription: RxSub = connectElementProps(rxNode, element);


  if (rxNode.children) {
    let createdChildrenMap: CreatedChildren = {};

    rxNode.children.forEach((child, index) => {
      if (isNull(child)) {
        // Nothing
        // TODO: Add other types
      } else if (isStringOrNumber(child) || isBoolean(child)) {
        createdChildrenMap = renderChildInIndexPosition(
          createTextNode(String(child)),
          String(index),
          element,
          createdChildrenMap
        );
      } else if (isElementNode(child as rxDom.RxNode<RxProps>)) {
        // renderRxElement is always returning cold observable so subscription
        // is not needed here and remove logic is also not needed
        renderRxElement(child as rxDom.RxNode<RxProps>).subscribe(
          connectedDOM => {
            const childElementSubscription = connectedDOM!.elementSubscription;
            if (childElementSubscription) {
              elementSubscription.add(childElementSubscription);
            }

            createdChildrenMap = renderChildInIndexPosition(
              connectedDOM!.dom!,
              String(index),
              element,
              createdChildrenMap
            );
          }
        );
      } else if (isComponentNode(child as rxDom.RxNode<RxProps>)) {
        const childElementSubscriptions: { [index: string]: RxSub | null } = {};
        const renderFragmentSubscriptions: { [index: string]: RxSub | null } = {};
        const childSub = renderRxComponent(child as rxDom.RxNode<RxProps>).subscribe(
          connectedDOM => {
            if (isNull(connectedDOM) || isNull(connectedDOM!.dom)) {
              if (connectedDOM && connectedDOM.indexInFragment) {
                // TODO: Remove Element Logic
                if (childElementSubscriptions[`${index}.${connectedDOM.indexInFragment}`]) {
                  childElementSubscriptions[`${index}.${connectedDOM.indexInFragment}`]!
                    .unsubscribe();
                  childElementSubscriptions[`${index}.${connectedDOM.indexInFragment}`] = null;
                }
              } else {
                // TODO: Remove Element Logic
                if (childElementSubscriptions[String(index)]) {
                  childElementSubscriptions[String(index)]!
                    .unsubscribe();
                  childElementSubscriptions[String(index)] = null;
                }
              }
            } else {
              if (connectedDOM.indexInFragment) {
                createdChildrenMap = renderChildFromFragment(
                  childElementSubscriptions,
                  index,
                  connectedDOM,
                  elementSubscription,
                  element,
                  createdChildrenMap,
                  renderFragmentSubscriptions
                );
              } else {
                createdChildrenMap = renderElementFromComponent(
                  childElementSubscriptions,
                  index,
                  connectedDOM,
                  elementSubscription,
                  element,
                  createdChildrenMap,
                  renderFragmentSubscriptions
                );
              }
            }
          }
        );
        elementSubscription.add(childSub);
      } else if (isFragmentNode(child as rxDom.RxNode<RxProps>)) {
        const childElementSubscriptions: { [index: string]: RxSub | null } = {};
        const childSub = renderRxFragment(child as rxDom.RxNode<RxProps>).subscribe(
          connectedDOM => {
            if (isNull(connectedDOM!.dom)) {
              // TODO: Remove Element Logic
              if (childElementSubscriptions[`${index}.${connectedDOM.indexInFragment}`]) {
                childElementSubscriptions[`${index}.${connectedDOM.indexInFragment}`]!
                  .unsubscribe();
                childElementSubscriptions[`${index}.${connectedDOM.indexInFragment}`] = null;
              }
            } else {
              createdChildrenMap = renderChildFromFragment(
                childElementSubscriptions,
                index,
                connectedDOM,
                elementSubscription,
                element,
                createdChildrenMap
              );
            }
          }
        );
        elementSubscription.add(childSub);
      } else if (isObservable(child)) {
        return {index, child};
      }
    });
  }

  return coldObservable({
    dom: element,
    elementSubscription
  });
}

function isRxNode(
  rxNode: rxDom.RxNode<RxProps>
): boolean {
  return isComponentNode(rxNode) || isElementNode(rxNode) || isFragmentNode(rxNode);
}


