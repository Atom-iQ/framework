import rxDOM from 'rx-ui-shared/src/types/rx-dom';
import {BehaviorSubject, fromEvent, isObservable, of, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import {App, Footer, Header} from './_tsx-to-ts';
import {appendChild, domCreateElement, getRootDomElement} from '../src/_utils/dom';
import {jsx as _jsx} from '../src/jsx';
import {isFunction, isNullOrUndef, isNumber, isString} from 'rx-ui-shared';
import rxComponent from 'rx-ui-shared/src/types/rx-component';

export const _createRxDOM: rxDOM.CreateRxDomFn = (
  {
    querySelector,
    element,
    RootComponent = App
  }
) => {
  const rootDom = getRootDomElement(element, querySelector);


  const rootRxNode = _jsx(RootComponent, {});

  if (rootRxNode && rootDom) {
    rootRxNode.subscribe(node => {
      generateDom(node, rootDom);
    });
  }
};

const rootComponentState = {
  header: new BehaviorSubject('Rx UI Suite'),
  showFooter: new BehaviorSubject(true)
};

const rootRxNode = {
  type: App,
  props: {},
  children$: undefined,
  _component: App
};

const rootComponentRxNode = {
  type: 'main',
  props: {
    className: of('Rx-dom'),
    id: 'main',
    onClick: () => rootComponentState.showFooter.next(false)
  },
  children: [
    of({
      type: Header,
      props: {
        header: rootComponentState.header.asObservable(),
        hElement: 'h1'
      },
      _component: Header
    }),
    of({
      type: 'section',
      props: {
        className: 'Rx-dom__section'
      },
      children: [
        of({
          type: Header,
          props: {
            header: 'New Section',
            hElement: 'h2'
          },
          _component: Header
        })
      ]
    }),
    rootComponentState.showFooter.pipe(map(value => value ? ({
      type: Footer,
      props: {
        setHeader: rootComponentState.header.next
      },
      _component: Footer
    }) : undefined))
  ]
};



function generateDom(
  rxNode: rxDOM.RxNode | null,
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
        generateDom(node, parentDom);
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
      rxNode.children.forEach((child, index) => {
        if (isObservable(child)) {
          const childSub = child.subscribe(
            (childValue: rxComponent.ComponentChild) => {
              if (!isNullOrUndef((<rxDOM.RxNode>childValue).type)) {
                const childElement = generateDom(
                  <rxDOM.RxNode>childValue,
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
