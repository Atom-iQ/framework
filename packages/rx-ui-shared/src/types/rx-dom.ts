import {Observable} from 'rxjs';
import dom from './dom';
import rxComponent from './rx-component';
import {UnknownObject} from './common';

namespace rxDOM {
  export interface RxElement extends HTMLElement {
    children$?: rxComponent.RxComponentChildren;
    /** Event listeners to support event delegation */
    _listeners: Record<string, (e: Event) => void>;

    ownerSVGElement?: SVGElement | null;

    // style: HTMLElement["style"]; // From HTMLElement

    data$?: Observable<string | number>; // From Text node
  }

  export type RxNodeType<P extends UnknownObject = UnknownObject> =
    dom.HtmlElementName | rxComponent.ObservableComponent<P>;

  export interface RxNode<P extends UnknownObject = UnknownObject> {
    type: RxNodeType<P>;
    props: rxComponent.ObservableProps<P>;
    children: rxComponent.RxComponentChildren | undefined;
    _component?: rxComponent.ObservableComponent<P> | undefined;
    // _original?: RxNode | null;
    _ref$?: rxComponent.ObservableRef | undefined;
    _key?: rxComponent.RxKey | undefined;
  }

  export type ObservableNode<P extends UnknownObject = UnknownObject> =
    Observable<RxNode<P> | null>;

  interface CreateRxDomFnConfig<P extends UnknownObject = UnknownObject> {
    querySelector?: string;
    element?: Element;
    RootComponent: rxComponent.ObservableComponent<P>;
  }

  export type CreateRxDomFn = (config: CreateRxDomFnConfig) => void;

  export type CreateRxElementFn<P extends UnknownObject = UnknownObject> = (
    type: RxNodeType<P>,
    props: rxComponent.ObservableReadableProps<P>,
    key?: rxComponent.RxKey
  ) => ObservableNode<P>;
}

export default rxDOM;
