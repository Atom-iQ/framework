import type { Observable, ObservableInput, Observer, Subscription } from '../types'
import { EMPTY_SUB, teardownSub } from '../subscription'
import { isArrayLike, isIterable, isPromise } from '../utils'

import { isObservable } from './isObservable'

export const from = <A>(input: ObservableInput<A>): Observable<A> => {
  if (isObservable<A>(input)) {
    return input
  }
  if (input) {
    if (isIterable(input)) {
      return fromIterable(input)
    }
    if (isArrayLike(input)) {
      return fromArray(input)
    }
    if (isPromise(input)) {
      return fromPromise(input as PromiseLike<A>)
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

export const fromPromise = <A>(promise: PromiseLike<A>): Observable<A> =>
  new FromPromise<A>(promise)

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

class FromPromise<A> implements Observable<A> {
  private readonly p: PromiseLike<A>

  constructor(p: PromiseLike<A>) {
    this.p = p
  }

  subscribe(observer: Observer<A>): Subscription {
    let active = true
    this.p.then(
      v => {
        if (active) {
          observer.next(v)
          observer.complete()
        }
      },
      e => active && observer.error(e)
    )
    return teardownSub(() => {
      active = false
    })
  }
}
