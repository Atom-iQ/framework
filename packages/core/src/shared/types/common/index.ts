import { Observable, Subscription } from 'rxjs'

export type EmptyArray = []
export type AnyArray<T = unknown> = Array<T>

export type FunctionType<Args = AnyArray, Result = unknown> = Args extends null
  ? (arg: Args) => Result
  : Args extends AnyArray
  ? (...args: Args) => Result
  : (arg: Args) => Result

export type NoArgsFunctionType<Result = unknown> = FunctionType<EmptyArray, Result>
export type VoidFunctionType<Args = AnyArray> = FunctionType<Args, void>
export type NoArgsVoidFunctionType = FunctionType<EmptyArray, void>
export type MultiParamFunctionType<
  Args extends AnyArray = AnyArray,
  Result = unknown
> = FunctionType<Args, Result>

/**
 * Basic, string indexed object
 */
export type Dictionary<T> = Record<string, T>
/**
 * Object with subscription field
 */
export interface WithRxSub {
  sub?: Subscription
}

export type StaticOrObservable<T> = T | Observable<T>
export type ObservableOrType<T> = T extends Observable<infer OT> ? Observable<OT> : T

export type NotObservable<T> = T extends Observable<unknown> ? never : T
export type OnlyObservable<T> = T extends Observable<infer OT> ? Observable<OT> : never
export type TypeOfObservable<T extends Observable<unknown>> = T extends Observable<infer OT>
  ? OT
  : never
