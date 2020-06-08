import rxDOM from './rx-dom';
import {BehaviorSubject, Observable} from 'rxjs';
import {AnyFunction, UnknownObject} from './common';
import {Rx} from './rx';

namespace rxComponent {
  export type RxKey = string | number | unknown;

  export type RefObject<T> = { current?: T | null };
  export type RefCallback<T> = (instance: T | null) => void;
  export type Ref<T> = RefObject<T> | RefCallback<T>;

  export type ObservableRef<T = unknown> = Rx<Ref<T>>;



  export type ComponentChild =
    | rxDOM.RxNode
    | UnknownObject
    | string
    | number
    | boolean
    | null
    | undefined;
  export type RxChild = ComponentChild | Rx<ComponentChild>;
  export type RxComponentChildren = RxChild[];


  export interface ChildrenProps {
    children?: RxComponentChildren;
  }

  export interface ObservableAttributes<RefType> {
    key?: RxKey;
    ref?: ObservableRef<RefType>
  }

  export type Prop<T> = Observable<T> |
    AnyFunction |
    string |
    number |
    null |
    undefined;

  export type ObservableCustomProps<P> = {
    [V in keyof P]?: Prop<P[V]>;
  };

  export type ObservableReadableProps<P, RefType = unknown> =
    ObservableCustomProps<P> &
    ObservableAttributes<RefType> &
    ChildrenProps;

  export type ObservableProps<P, RefType = unknown> =
    ObservableCustomProps<P> &
    Readonly<ObservableAttributes<RefType> & ChildrenProps>;

  export type ObservableContext<C> = Observable<C>;

  export interface ObservableComponent<
      P extends UnknownObject = UnknownObject, C = unknown
    > {
    (
      props: ObservableReadableProps<P>,
      context$?: ObservableContext<C>
    ): rxDOM.ObservableNode<P> | null;

    displayName?: string;
    defaultProps?: Partial<P>;
  }

  export type RxStateFn<T = unknown> = (initialState: T) =>
    [Rx<T>, () => (valueOrNext: T | Rx<T>) => void, Rx<T, BehaviorSubject<T>>]
}

export default rxComponent;
