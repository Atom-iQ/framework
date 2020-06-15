import {
  AsyncSubject,
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subject,
  Subscription
} from 'rxjs';
/**
 *  RxJS Types Shorthands, Utils and Custom Types
 *
 *  As Observable and other RxJS types, are probably most used types
 *  in RxO UI Suite library, shorthand types from this file could be
 *  used, to make the code more concise and better readable.
 *  It should be intuitive and well, 100 * RxO<T> in file,
 *  looks really better than 100 * Observable<T>
 */

//
//  Shorthands
// ----------------------------------------------------------------------------

/**
 *  type RxO<T>
 *  type RxO<T, O = Observable<T>>
 *
 *  Shorthand for RxJS Observable and all types that extends Observable.
 *
 *  First generic type param - T (required), is of course the same as
 *  for Observable (Observable<T>) - it's just a type of value,
 *  that Observable is streaming.
 *
 *  But RxO isn't exact shorthand
 */
export type RxO<T, O extends Observable<T> = Observable<T>> = O;
/**
 *  type RxS<T>
 *
 *  Shorthand for RxJS Subject<T>
 */
export type RxS<T, S extends Subject<T> = Subject<T>> = RxO<T, S>;
/**
 *  type RxBS<T>
 *
 *  Shorthand for RxJS BehaviorSubject<T>
 */
export type RxBS<T> = RxS<T, BehaviorSubject<T>>;
/**
 *  type RxRS<T>
 *
 *  Shorthand for RxJS ReplaySubject<T>
 */
export type RxRS<T> = RxS<T, ReplaySubject<T>>;
/**
 *  type RxAS<T>
 *
 *  Shorthand for RxJS AsyncSubject<T>
 */
export type RxAS<T> = RxS<T, AsyncSubject<T>>;

export type RxSub = Subscription;
