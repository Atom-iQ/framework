/** OBSERVABLE INTERFACE */

/**
 * Observable stream interface
 */
export interface Observable<T> {
  subscribe(observer: Observer<T>): Subscription
}

/** OPERATOR INTERFACES */

export interface ComposableOperator<T, R> {
  (source: Observable<T>): Observable<R>
}

/**
 * A value and the time at which it was emitted.
 *
 * Emitted by the `timestamp` operator
 *
 * @see {@link timestamp}
 */
export interface Timestamp<T> {
  value: T
  /**
   * The timestamp. By default, this is in epoch milliseconds.
   * Could vary based on the timestamp provider passed to the operator.
   */
  timestamp: number
}

/**
 * A value emitted and the amount of time since the last value was emitted.
 *
 * Emitted by the `timeInterval` operator.
 *
 * @see {@link timeInterval}
 */
export interface TimeInterval<T> {
  value: T

  /**
   * The amount of time between this value's emission and the previous value's emission.
   * If this is the first emitted value, then it will be the amount of time since subscription
   * started.
   */
  interval: number
}

/** SUBSCRIPTION INTERFACES */

export interface Unsubscribable {
  unsubscribe(): void
}

export interface Subscription extends Unsubscribable {
  unsubscribe(): void
  hasParent(parent: ParentSubscription): boolean
  addParent(parent: ParentSubscription): void
  removeParent(parent: ParentSubscription): void
  removeFromParents(): void
  readonly active: boolean
}

export interface ParentSubscription extends Subscription {
  add(subscription: Subscription): void
  remove(subscription: Subscription): void
}
/**
 * Valid types that can be converted to observables.
 */
export type ObservableInput<T> = Observable<T> | PromiseLike<T> | ArrayLike<T> | Iterable<T>

/** OBSERVER INTERFACES */

export interface NextObserver<T> {
  closed?: boolean
  next: (value: T) => void
  error?: (err: Error) => void
  complete?: () => void
}

export interface ErrorObserver<T> {
  closed?: boolean
  next?: (value: T) => void
  error: (err: Error) => void
  complete?: () => void
}

export interface CompletionObserver<T> {
  closed?: boolean
  next?: (value: T) => void
  error?: (err: Error) => void
  complete: () => void
}

export type PartialObserver<T> = NextObserver<T> | ErrorObserver<T> | CompletionObserver<T>

export interface Observer<T> {
  next: (value: T) => void
  error: (err: Error) => void
  complete: () => void
}

/** SCHEDULER INTERFACES */

export interface SchedulerLike extends TimestampProvider {
  schedule<T>(
    work: (this: SchedulerAction<T>, state: T) => void,
    delay: number,
    state: T
  ): Subscription
  schedule<T>(
    work: (this: SchedulerAction<T>, state?: T) => void,
    delay: number,
    state?: T
  ): Subscription
  schedule<T>(
    work: (this: SchedulerAction<T>, state?: T) => void,
    delay?: number,
    state?: T
  ): Subscription
}

export interface SchedulerAction<T> extends Subscription {
  schedule(state?: T, delay?: number): Subscription
}

export type SchedulerActionConstructor = {
  new <T>(
    scheduler: SchedulerLike,
    work: (this: SchedulerAction<T>, state?: T) => void
  ): SchedulerAction<T>
}

/**
 * This is a type that provides a method to allow RxJS to create a numeric timestamp
 */
export interface TimestampProvider {
  /**
   * Returns a timestamp as a number.
   *
   * This is used by types like `ReplaySubject` or operators like `timestamp` to calculate
   * the amount of time passed between events.
   */
  now(): number
}

/**
 * Extracts the type from an `ObservableInput<any>`. If you have
 * `O extends ObservableInput<any>` and you pass in `Observable<number>`, or
 * `Promise<number>`, etc, it will type as `number`.
 */
export type ObservedValueOf<O> = O extends ObservableInput<infer T> ? T : never

/**
 * Extracts a union of element types from an `ObservableInput<any>[]`.
 * If you have `O extends ObservableInput<any>[]` and you pass in
 * `Observable<string>[]` or `Promise<string>[]` you would get
 * back a type of `string`.
 * If you pass in `[Observable<string>, Observable<number>]` you would
 * get back a type of `string | number`.
 */
export type ObservedValueUnionFromArray<X> = X extends Array<ObservableInput<infer T>> ? T : never

/**
 * @deprecated Renamed to {@link ObservedValueUnionFromArray}. Will be removed in v8.
 */
export type ObservedValuesFromArray<X> = ObservedValueUnionFromArray<X>

/**
 * Extracts a tuple of element types from an `ObservableInput<any>[]`.
 * If you have `O extends ObservableInput<any>[]` and you pass in
 * `[Observable<string>, Observable<number>]` you would get back a type
 * of `[string, number]`.
 */
export type ObservedValueTupleFromArray<X> = { [K in keyof X]: ObservedValueOf<X[K]> }

/**
 * Used to infer types from arguments to functions like {@link forkJoin}.
 * So that you can have `forkJoin([Observable<A>, PromiseLike<B>]): Observable<[A, B]>`
 * et al.
 */
export type ObservableInputTuple<T> = {
  [K in keyof T]: ObservableInput<T[K]>
}

/**
 * Constructs a new tuple with the specified type at the head.
 * If you declare `Cons<A, [B, C]>` you will get back `[A, B, C]`.
 */
export type Cons<X, Y extends readonly any[]> = ((arg: X, ...rest: Y) => any) extends (
  ...args: infer U
) => any
  ? U
  : never

/**
 * Extracts the head of a tuple.
 * If you declare `Head<[A, B, C]>` you will get back `A`.
 */
export type Head<X extends readonly any[]> = ((...args: X) => any) extends (
  arg: infer U,
  ...rest: any[]
) => any
  ? U
  : never

/**
 * Extracts the tail of a tuple.
 * If you declare `Tail<[A, B, C]>` you will get back `[B, C]`.
 */
export type Tail<X extends readonly any[]> = ((...args: X) => any) extends (
  arg: any,
  ...rest: infer U
) => any
  ? U
  : never

/**
 * Extracts the generic value from an Array type.
 * If you have `T extends Array<any>`, and pass a `string[]` to it,
 * `ValueFromArray<T>` will return the actual type of `string`.
 */
export type ValueFromArray<A extends readonly unknown[]> = A extends Array<infer T> ? T : never

/**
 * A simple type to represent a gamut of "falsy" values... with a notable exception:
 * `NaN` is "falsy" however, it is not and cannot be typed via TypeScript. See
 * comments here: https://github.com/microsoft/TypeScript/issues/28682#issuecomment-707142417
 */
export type Falsy = null | undefined | false | 0 | -0 | 0n | ''

export type TruthyTypesOf<T> = T extends Falsy ? never : T
