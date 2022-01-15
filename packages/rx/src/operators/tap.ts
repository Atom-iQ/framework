import { Observable, Observer, Subscription } from '../types'
import { OperatorObserver } from '../observer'

export const tap = <A>(f: (a: A) => unknown, stream: Observable<A>): Observable<A> =>
  new Tap(f, stream)

class Tap<A> implements Observable<A> {
  private readonly f: (a: A) => unknown
  private readonly source: Observable<A>

  constructor(f: (a: A) => unknown, source: Observable<A>) {
    this.f = f
    this.source = source
  }

  subscribe(observer: Observer<A>): Subscription {
    return this.source.subscribe(new TapObserver(this.f, observer))
  }
}

class TapObserver<A> extends OperatorObserver<A, A> implements Observer<A> {
  private readonly f: (a: A) => unknown

  constructor(f: (a: A) => unknown, observer: Observer<A>) {
    super(observer)
    this.f = f
  }

  next(v: A): void {
    this.f(v)
    this.observer.next(v)
  }
}
