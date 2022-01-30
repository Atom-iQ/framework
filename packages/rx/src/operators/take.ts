import { Observable, Observer, Subscription } from '../types'
import { OperatorObserver } from '../observer'
import { empty } from '../observable'

import { filter } from './filter'

export const findFirst = <A>(p: (a: A) => boolean, source: Observable<A>): Observable<A> =>
  filter(p, take(1, source))

export const first = <A>(source: Observable<A>): Observable<A> => take(1, source)

export const take = <A>(count: number, source: Observable<A>): Observable<A> =>
  count <= 0 ? empty() : new Take(count, source)

class Take<A> implements Observable<A> {
  private readonly c: number
  private readonly source: Observable<A>

  constructor(c: number, source: Observable<A>) {
    this.c = c
    this.source = source
  }

  subscribe(observer: Observer<A>): Subscription {
    return this.source.subscribe(new TakeObserver(this.c, observer))
  }
}

class TakeObserver<A> extends OperatorObserver<A, A> implements Observer<A> {
  private s: number
  private readonly c: number

  constructor(c: number, observer: Observer<A>) {
    super(observer)
    this.s = 0
    this.c = c
  }

  next(v: A): void {
    if (++this.s <= this.c) {
      this.observer.next(v)

      if (this.c <= this.s) {
        this.observer.complete()
      }
    }
  }
}
