import {RxO} from '../rxjs';
import {AnyFunction, TOrEmpty, UnknownObject} from '../common';
import {RxRefProp} from '../rx-ref';

export type RxPrimitiveProp = TOrEmpty<
  string | number | boolean
  >;

export type RxArrayProp = Array<
  RxPrimitiveProp |
  RxArrayProp |
  RxObjectProp |
  RxDomElement
  >;

export type RxObjectProp = Record<
  string,
  RxPrimitiveProp | RxArrayProp | UnknownObject | RxDomElement
  >;


export type RxStaticProp =
  RxPrimitiveProp |
  RxArrayProp |
  RxObjectProp |
  RxDomElement;

export type RxCallbackProp = Function;

export type RxObservableProp<
  T extends RxStaticProp = RxStaticProp
  > = RxO<T>;

export type RxProp<
  T extends RxStaticProp = RxStaticProp
  > = T | RxCallbackProp | RxObservableProp<T>;

export type RxStaticChild = RxStaticProp;

export type RxObservableChild<
  T extends RxStaticChild = RxStaticChild
  > = RxObservableProp<T> |
  Array<RxObservableProp<T>> |
  Record<string, RxObservableProp<T>>;

export type RxChild<T extends RxStaticChild = RxStaticChild> =
  T | RxObservableChild<T>;

export type RxChildren = Array<RxChild> | RxChild;

export interface RxSpecialProps {
  children?: RxChildren;
  ref?: RxRefProp;
  [key: string]: RxProp | RxChildren;
}

