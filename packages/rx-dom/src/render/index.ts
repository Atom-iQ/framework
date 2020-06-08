import {
  isFunction,
  isNumber,
  isString,
  rxDom,
  rxComponent,
  isNullOrUndef
} from 'rx-ui-shared';
import {appendChild, domCreateElement, getRootDomElement} from '../_utils/dom';
import {createRxElement} from '../jsx';
import {fromEvent, isObservable, Subscription} from 'rxjs';

export const createRxDOM: rxDom.CreateRxDomFn = (
  {
    querySelector,
    element,
    RootComponent
  }
) => {
  const rootDom = getRootDomElement(element, querySelector);
  const rootRxNode = createRxElement(RootComponent, {});

  if (rootRxNode && rootDom) {
    rootRxNode.subscribe(node => {
      renderRxDom(node, rootDom);
    });
  }
};



function renderRxDom(
  rxNode: rxDom.RxNode | null,
  parentDom: Element
) {
  if (!rxNode) {
    return null;
  }

  // const rootComponentRxNode = rxNode._component(rxNode.props);
  if (isFunction(rxNode.type) && rxNode._component) {
    const componentNode = rxNode._component(rxNode.props);
    if (componentNode) {
      componentNode.subscribe(node => {
        renderRxDom(node, parentDom);
      });
    }
  }


  if (isString(rxNode.type)) {
    const element = domCreateElement(
      rxNode.type,
      false
    );
    let attributesSubscriptions: Subscription[] = [];
    let eventsSubscriptions: Subscription[] = [];
    let childrenSubscriptions: Subscription[] = [];

    if (rxNode.props) {
      Object.keys(rxNode.props).forEach(propName => {
        const prop = rxNode.props[propName];
        if (isObservable(prop)) {
          const attrSub = prop.subscribe(propValue => {
            element.setAttribute(propName, String(propValue));
          });
          attributesSubscriptions = attributesSubscriptions.concat(attrSub);
        } else if (isFunction(prop)) {
          if (propName.startsWith('on')) {
            const eventName = propName.slice(2).toLocaleLowerCase();
            const eventSub = fromEvent(element, eventName)
              .subscribe(event => prop(event));
            eventsSubscriptions = eventsSubscriptions.concat(eventSub);
          }
        } else if (isString(prop) || isNumber(prop)) {
          element.setAttribute(propName, String(prop));
        }
      });
    }

    if (rxNode.children) {
      rxNode.children.forEach((child) => {
        if (isObservable(child)) {
          const childSub = child.subscribe(
            (childValue: rxComponent.ComponentChild) => {
              if (!isNullOrUndef((<rxDom.RxNode>childValue).type)) {
                const childElement = renderRxDom(
                  <rxDom.RxNode>childValue,
                  element
                );
                if (childElement) {
                  element.insertAdjacentElement(
                    'beforeend',
                    childElement
                  );
                } else {
                  // Remove Element
                }
              } else if (isString(childValue) || isNumber(childValue)) {
                element.insertAdjacentText('beforeend', String(childValue));
              }
            });
          childrenSubscriptions = childrenSubscriptions.concat(childSub);
        } else if (isFunction(child)) {
          // TODO
        } else if (isString(child) || isNumber(child)) {
          element.insertAdjacentText(
            'beforeend',
            String(child)
          );// TODO: Sanitize
        }
      });
    }

    appendChild(parentDom, element);
  }

}
