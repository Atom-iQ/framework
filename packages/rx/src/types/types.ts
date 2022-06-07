/* OBSERVABLE INTERFACE */

/**
 * Observable interface
 */
export interface Observable<T> {
  subscribe(observer: Observer<T>): Subscription
}

/**
 * Observable state interface
 */
export interface ObservableState<T> extends Observable<T>, Observer<T>, Unsubscribable {
  /**
   * v - getter and setter for state value
   *
   * getter - get actual state value
   * setter - save actual state value and emit it to observers/schedule async update
   */
  v: T
}

export type PipeableOperator<A, B> = (source: Observable<A>) => Observable<B>

/* SUBSCRIPTION INTERFACES */

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
