import { rxDom, rxComponent, UnknownObject } from 'rx-ui-shared';
import {of} from 'rxjs';

function castToComponent<P extends UnknownObject = UnknownObject>(
  type: rxDom.RxNodeType<P> | undefined
): rxComponent.ObservableComponent<P> {
  return <rxComponent.ObservableComponent<P>>type;
}

function createRxElement<P extends UnknownObject = UnknownObject>(
  type: rxDom.RxNodeType<P>,
  props: rxComponent.ObservableReadableProps<P>,
  key?: rxComponent.RxKey
): rxDom.ObservableNode<P> {
  const getProp = (propKey: string) => {
    const defaultProps = typeof type === 'function' &&
      castToComponent<P>(type) &&
      castToComponent<P>(type).defaultProps;
    if (defaultProps && props[propKey] === undefined) {
      return defaultProps[propKey];
    }
    return props[propKey];
  };

  const normalizedProps: rxComponent.ObservableReadableProps<P> =
      Object.keys(props).reduce((newProps, propKey) => {
        const isNotRef: boolean = propKey !== 'ref';
        return isNotRef ? {
          ...newProps,
          [propKey]: getProp(propKey)
        } : newProps;
      }, {});

  return createRxNode(
    type,
    normalizedProps,
    key || undefined,
    (props && props.ref) || undefined
  );
}

export function createRxNode<P extends UnknownObject = UnknownObject>(
  type: rxDom.RxNodeType<P>,
  props: rxComponent.ObservableReadableProps<P>,
  key?: rxComponent.RxKey | undefined,
  ref?: rxComponent.ObservableRef | undefined
): rxDom.ObservableNode<P> {
  const { children, ...restProps } = props;
  const propsWithoutChildren =
    <rxComponent.ObservableReadableProps<P>>restProps;

  const rxNode: rxDom.RxNode<P> = {
    type,
    props: propsWithoutChildren,
    children,
    _ref$: ref,
    _key: key
  };

  if (typeof type === 'function') rxNode._component = type;

  return of(rxNode);
}


export default createRxElement;

