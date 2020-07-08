import { rxDom } from 'rx-ui-shared';
import {RxChild, RxSpecialProps} from 'rx-ui-shared/src/types/dom/props';
import {RxRefProp} from 'rx-ui-shared/src/types/rx-ref';


function createRxElement(
  type: rxDom.RxNodeType,
  props: RxProps,
  children: RxChild[] | null
): rxDom.RxNode<RxProps> {
  const normalizedProps: RxProps =
      Object.keys(props).reduce((newProps, propKey) => {
        const isNotRef: boolean = propKey !== 'ref';
        return isNotRef ? {
          ...newProps,
          [propKey]: (props as Record<string, unknown>)[propKey]
        } : newProps;
      }, {});

  return createRxNode(
    type,
    Object.keys(normalizedProps).length > 0 ?
      normalizedProps : null,
    children,
    (props && (props as RxSpecialProps).ref) || undefined
  );
}

export function createRxNode(
  type: rxDom.RxNodeType,
  props: RxProps | null,
  children: RxChild[] | null,
  ref?: RxRefProp
): rxDom.RxNode<RxProps> {

  const rxNode: rxDom.RxNode<RxProps> = {
    type,
    props,
    children
  };

  if (ref) rxNode.ref = ref;
  if (typeof type === 'function') rxNode._component = type;

  return rxNode;
}


export default createRxElement;

