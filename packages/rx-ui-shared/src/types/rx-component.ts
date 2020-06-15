import rxDom from './dom/rx-dom';
import {BehaviorSubject, Observable} from 'rxjs';
import {
  AnyFunction,
  TOrEmpty,
  UnknownObject
} from './common';
import {
  RxObservableProp,
  RxProp,
  RxSpecialProps,
  RxStaticProp
} from './dom/props';
import {RxBS, RxO} from './rxjs';
import {RxRef, RxRefPropReference} from './rx-ref';

namespace rxComponent {
  /*
   * Component
   */

  export interface RxComponent<
    P extends RxComponentProps = RxComponentProps,
    C extends {} = {}
    > {
    (
      props: P,
      context?: RxContext<C>
    ): rxDom.RxNode<P> | RxO<rxDom.RxNode<P>> | null;

    displayName?: string;
    defaultProps?: RxComponentProps;
  }

  /*
   * Component Props
   */
  export type RxObservableObjectProp<
    T extends RxStaticProp = RxStaticProp
    > = Record<string, RxObservableProp<T>>;

  export type RxObservableArrayProp<
    T extends RxStaticProp = RxStaticProp
  > = Array<RxObservableProp<T>>;

  export type RxObservableComponentProp<
    T extends RxStaticProp = RxStaticProp
  > = RxObservableProp<T> |
    RxObservableArrayProp<T> |
    RxObservableObjectProp<T>;

  export type RxComponentProp<
    T extends RxStaticProp = RxStaticProp
  > = RxProp<T> | RxObservableComponentProp<T>;


  export type RxComponentSpecialProps = RxSpecialProps;

  export type RxComponentProps<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    P extends any = any
    > = P | RxComponentSpecialProps;

  /*
   * Component State
   */

  export type RxSetStateCallback<T> = (value: TOrEmpty<T>) => TOrEmpty<T>;
  export type RxSetStateFn<T> =
    (valueOrCallback: TOrEmpty<T> | RxSetStateCallback<T>) => void;

  export type RxState<T extends unknown = unknown> = [
    RxO<T>,
    RxSetStateFn<T>,
    RxBS<T>
  ];
  /*
   * Component Ref
   */

  export interface RxRefComponentPropReference<
    T extends RxStaticProp = RxStaticProp
  > extends RxRefPropReference<T> {
    prop$?: RxObservableProp<T>;
    nested?: RxRefComponentPropReference<RxStaticProp>
    next?: (nextPropValue: T) => void;
    staticProp?: T;
  }

  export interface RxRefComponentStateReference<
    T extends unknown = unknown
  > {
    state$: RxO<T>;
    setState: RxSetStateFn<T>;
    stateSubject: RxO<T, BehaviorSubject<T>>
  }

  export type RxRefComponentPropsMap<P extends UnknownObject = UnknownObject> =
    Record<keyof P, RxRefComponentPropReference>;

  export type RxRefComponentStateMap<
    S extends UnknownObject = UnknownObject
  > = {
    [V in keyof S]?: RxRefComponentStateReference<S[V]>;
  }

  export type RxRefComponentFunctionsMap = Record<string, AnyFunction>;

  export interface RxComponentRef<
    P extends UnknownObject = UnknownObject,
    S extends UnknownObject = UnknownObject
  > extends RxRef<P> {
    props: RxRefComponentPropsMap<P>;
    state: RxRefComponentStateMap<S>;
    functions: RxRefComponentFunctionsMap;
  }

  /*
   * Context
   */

  export type RxContext<C extends UnknownObject = UnknownObject> = {
    [V in keyof C]?: Observable<C[V]>;
  };
}

export default rxComponent;
