import { Observable, ObservableInput, Observer, Subscription } from '../types'
import { EMPTY_SUB } from '../subscription'
import { isObservable } from './isObservable'

export const from = <A>(input: ObservableInput<A>): Observable<A> => {
  if (isObservable<A>(input)) {
    return input
  }
  if (input) {
    if (Array.isArray(input)) {
      return fromArray(input)
    }
  }
  throw new Error('Invalid observable input')
}

export const of = <A>(...values: A[]): Observable<A> => {
  return from(values)
}

export const fromArray = <A>(array: ArrayLike<A>): Observable<A> => new FromArray<A>(array)
export const fromIterable = <A>(iterable: Iterable<A>): Observable<A> =>
  new FromIterable<A>(iterable)

class FromArray<A> implements Observable<A> {
  private readonly a: ArrayLike<A>

  constructor(a: ArrayLike<A>) {
    this.a = a
  }

  subscribe(observer: Observer<A>): Subscription {
    const a = this.a
    for (let i = 0; i < a.length; i++) {
      observer.next(a[i])
    }
    observer.complete()
    return EMPTY_SUB
  }
}

class FromIterable<A> implements Observable<A> {
  private readonly i: Iterable<A>

  constructor(i: Iterable<A>) {
    this.i = i
  }

  subscribe(observer: Observer<A>): Subscription {
    for (const v of this.i) {
      observer.next(v)
    }
    observer.complete()
    return EMPTY_SUB
  }
}
