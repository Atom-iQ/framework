import { isFunction } from '@atom-iq/fx'

import { Observable, Subscription, Observer, ObservableInput } from '../types'

import { from, of } from './from'
import { empty } from './empty'

export interface ObservableFactory {
  (): Observable<never>
  <T>(input: ObservableInput<T>): Observable<T>
  <T>(subscribe: Observable<T>['subscribe']): Observable<T>
  <T extends any[]>(...values: T): Observable<T>
}

export const observable: ObservableFactory = <T>(
  inputOrSubscribe?: T | ObservableInput<T> | Observable<T>['subscribe'],
  ...values: T[]
): Observable<T> =>
  inputOrSubscribe
    ? values.length
      ? of(inputOrSubscribe, ...values)
      : isFunction(inputOrSubscribe)
      ? customObservable(inputOrSubscribe)
      : from(inputOrSubscribe as ObservableInput<T>)
    : empty()

export const customObservable = <T>(subscribe: Observable<T>['subscribe']): Observable<T> =>
  new CustomObservable(subscribe)

export class CustomObservable<T> implements Observable<T> {
  public subscribe: (observer: Observer<T>) => Subscription

  constructor(subscribe: (observer: Observer<T>) => Subscription) {
    this.subscribe = subscribe
  }
}
