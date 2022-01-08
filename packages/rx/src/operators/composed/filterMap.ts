import { OperatorObserver } from '../../observer'
import { Observable, Observer, Subscription } from '../../types'

export class FilterMap<A, B> implements Observable<B> {
  constructor(
    private readonly p: (a: A) => boolean,
    private readonly f: (a: A) => B,
    private readonly source: Observable<A>
  ) {}

  subscribe(observer: Observer<B>): Subscription {
    return this.source.subscribe(new FilterMapObserver(this.p, this.f, observer))
  }
}

class FilterMapObserver<A, B> extends OperatorObserver<A, B> implements Observer<A> {
  constructor(
    private readonly p: (a: A) => boolean,
    private readonly f: (a: A) => B,
    observer: Observer<B>
  ) {
    super(observer)
  }

  next(v: A): void {
    const f = this.f
    const p = this.p
    p(v) && this.observer.next(f(v))
  }
}
