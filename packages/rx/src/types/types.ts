/** OBSERVABLE INTERFACE */

/**
 * Observable interface
 */
export interface Observable<T> {
  subscribe(observer: Observer<T>): Subscription
}

/**
 * Observable state interface
 */
export interface ObservableState<T> extends Observable<T>, Observer<T> {
  /**
   * v - getter and setter for state value
   *
   * getter - get actual state value
   * setter - save actual state value and emit it to observers/schedule async update
   */
  v: T
}
export type PipeableOperator<A, B> = (source: Observable<A>) => Observable<B>
export type GenericPipeableOperator = <A, B>(source: Observable<A>) => Observable<B>

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
  readonly a: boolean // a - active - is subscription active
  hasParent(parent: ParentSubscription): boolean
  addParent(parent: ParentSubscription): void
  removeParent(parent: ParentSubscription): void
  removeFromParents(): void
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

/**
 * Observer interface
 */
export interface Observer<T> {
  next: (value: T) => void
  error: (err: Error) => void
  complete: () => void
}

export type PartialObserver<T> = Partial<Observer<T>>

/** SCHEDULER INTERFACES */

export interface Scheduler extends TimestampProvider {
  schedule<S, A extends SchedulerAction<S>>(
    work: (this: A, state: S) => void,
    delay: number,
    state: S
  ): Subscription
  schedule<S, A extends SchedulerAction<S>>(
    work: (this: A, state?: S) => void,
    delay: number,
    state?: S
  ): Subscription
  schedule<S, A extends SchedulerAction<S>>(
    work: (this: A, state?: S) => void,
    delay?: number,
    state?: S
  ): Subscription
}

export interface SchedulerAction<T> extends Subscription {
  schedule(state?: T, delay?: number): Subscription
}

export interface SchedulerActionConstructor {
  new <S, A extends SchedulerAction<S>>(scheduler: Scheduler, work: (this: A, state?: S) => void): A
}

/**
 * Timestamp Provider
 *
 * Object with now() method, used to get the actual timestamp
 */
export interface TimestampProvider {
  /**
   * Returns a timestamp as a number.
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
