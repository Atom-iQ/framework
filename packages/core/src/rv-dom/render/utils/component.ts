import {rxComponent, rxDom, RxO} from 'packages/rx-ui-shared';
import {isFunction} from 'rx-ui-shared/src/utils/index';

function isComponentNode(
  rxNode: rxDom.RxNode<RxProps>
): boolean {
  return Boolean(isFunction(rxNode.type) && rxNode._component);
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

function renderComponent(
  rxNode: rxDom.RxNode<RxProps>
): rxDom.RxNode<RxProps> | string | number | null |
  RxO<rxDom.RxNode<RxProps> | string | number | null>
{
  return rxNode._component!(getComponentProps(rxNode));
}

export { isComponentNode, renderComponent };
