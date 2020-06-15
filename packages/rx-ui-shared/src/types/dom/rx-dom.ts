import rxComponent from '../rx-component';
import {TOrEmpty} from '../common';
import {RxChild,} from './props';
import {RxRefProp} from '../rx-ref';
import {RxO} from '../rxjs';

namespace rxDom {
  export type RxNodeType =
    string | rxComponent.RxComponent;

  export interface RxNode<P extends RxProps> {
    type: RxNodeType;
    props: P | null;
    children: RxChild[] | null;
    _component?: rxComponent.RxComponent;
    ref?: RxRefProp;
  }

  export type RxObservableNode<P extends RxProps> =
    RxO<TOrEmpty<RxNode<P>>>;

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
