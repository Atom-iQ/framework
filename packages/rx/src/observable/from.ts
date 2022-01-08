import { Observable, Observer, Subscription } from '../types'
import { EMPTY_SUB } from '../subscription'

export const fromArray = <A>(array: ArrayLike<A>): Observable<A> => new FromArray<A>(array)
export const fromIterable = <A>(iterable: Iterable<A>): Observable<A> =>
  new FromIterable<A>(iterable)

class FromArray<A> implements Observable<A> {
  constructor(private readonly a: ArrayLike<A>) {}

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
  constructor(private readonly i: Iterable<A>) {}

  subscribe(observer: Observer<A>): Subscription {
    for (const v of this.i) {
      observer.next(v)
    }
    observer.complete()
    return EMPTY_SUB
  }
}
