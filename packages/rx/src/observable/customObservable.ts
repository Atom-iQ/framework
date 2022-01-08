import { Observable, Subscription, Observer } from '../types'

export const customObservable = <T>(
  subscribe: (observer: Observer<T>) => Subscription
): Observable<T> => new CustomObservable(subscribe)

export class CustomObservable<T> implements Observable<T> {
  constructor(public subscribe: (observer: Observer<T>) => Subscription) {}
}
