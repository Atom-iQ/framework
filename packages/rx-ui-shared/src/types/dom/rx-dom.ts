import rxComponent from '../rx-component';
import {RxChild,} from './props';
import {RxRefProp} from '../rx-ref';
// TODO: Remove namespace or use namespaces for every type category
namespace rxDom {
  export type RxNodeType =
    string | rxComponent.RxComponent;

  export interface RxNode<P extends RxProps> {
    type: RxNodeType;
    props: P | null;
    children: RxChild[] | null;
    ref?: RxRefProp;
    _component?: rxComponent.RxComponent;
    _fragmentKey?: string;
  }


  export interface CreateRxDomFnConfig<P extends RxProps = RxProps> {
    querySelector?: string;
    element?: Element;
  }

  export type CreateRxDomFn<P extends RxProps = RxProps> = (
    rootNode: RxNode<P>,
    config: CreateRxDomFnConfig<P>
  ) => void;

}

export default rxDom;
