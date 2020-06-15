import {
  isFunction,
  isNumber,
  isString,
  rxDom,
  rxComponent,
  isNullOrUndef
} from 'rx-ui-shared';
import {appendChild, domCreateElement, getRootDomElement} from '../_utils/dom';
import {fromEvent, isObservable, Subscription} from 'rxjs';
import {RxChild} from 'rx-ui-shared/src/types/dom/props';

const createRxDOM: rxDom.CreateRxDomFn = <P>(
  rootNode: rxDom.RxNode<rxComponent.RxComponentProps>,
  {
    querySelector,
    element
  }: rxDom.CreateRxDomFnConfig<P>
) => {
  const rootDom = getRootDomElement(element, querySelector);

  /* ----------------------------------------------
   * rootNode may look like this:
   * {
   *   type: App,
   *   props: {}
   *   children: null
   *   _component: App
   * }
   * ------------------------------------------- */
  renderRxDom(rootNode, rootDom);
};


function renderRxDom(
  rxNode: rxDom.RxNode<RxProps> | null,
  parentDom: Element | null
) {
  if (!rxNode) {
    return;
  }

  if (isComponentNode(rxNode)) {
    const componentNode = renderComponent(rxNode);

    if (!componentNode) {
      return;
    }

    if (isObservable(componentNode)) {
      componentNode.subscribe(node => {
        renderRxDom(node, parentDom);
      });
    } else {
      renderRxDom(componentNode, parentDom);
    }

  } else if (isFragmentNode(rxNode)) {
    // todo
  } else if (isElementNode(rxNode)) {
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
            (childValue: RxChild) => {
              if (!isNullOrUndef(childValue.type)) {
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

function isComponentNode(
  rxNode: rxDom.RxNode<RxProps>
): boolean {
  return Boolean(isFunction(rxNode.type) && rxNode._component);
}

function isElementNode(
  rxNode: rxDom.RxNode<RxProps>
): boolean {
  return isString(rxNode.type) && rxNode.type !== '_Fragment';
}

function isFragmentNode(
  rxNode: rxDom.RxNode<RxProps>
): boolean {
  return isString(rxNode.type) && rxNode.type === '_Fragment';
}

function getComponentProps(
  rxNode: rxDom.RxNode<RxProps>
): rxComponent.RxComponentProps {
  const componentProps = rxNode.props;
  if (rxNode.children) {
    componentProps.children = rxNode.children;
  }
  if (rxNode.ref) {
    componentProps.ref = rxNode.ref;
  }
  return componentProps;
}

function renderComponent(rxNode: rxDom.RxNode<RxProps>) {
  return rxNode._component!(getComponentProps(rxNode));
}

export default createRxDOM;
