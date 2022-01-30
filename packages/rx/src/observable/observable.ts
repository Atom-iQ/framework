import { Observable, Subscription, Observer, ObservableInput } from '../types'
import { isFunction } from '../utils'

import { from } from './from'

export const observable = <T>(
  inputOrSubscribe: ObservableInput<T> | Observable<T>['subscribe']
): Observable<T> =>
  isFunction(inputOrSubscribe) ? customObservable(inputOrSubscribe) : from(inputOrSubscribe)

export const customObservable = <T>(subscribe: Observable<T>['subscribe']): Observable<T> =>
  new CustomObservable(subscribe)

export class CustomObservable<T> implements Observable<T> {
  public subscribe: (observer: Observer<T>) => Subscription

  constructor(subscribe: (observer: Observer<T>) => Subscription) {
    this.subscribe = subscribe
  }
}
