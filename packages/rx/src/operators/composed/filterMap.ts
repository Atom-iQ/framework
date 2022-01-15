import { OperatorObserver } from '../../observer'
import { Observable, Observer, Subscription } from '../../types'

export class FilterMap<A, B> implements Observable<B> {
  private readonly p: (a: A) => boolean
  private readonly f: (a: A) => B
  private readonly source: Observable<A>

  constructor(p: (a: A) => boolean, f: (a: A) => B, source: Observable<A>) {
    this.p = p
    this.f = f
    this.source = source
  }

  subscribe(observer: Observer<B>): Subscription {
    return this.source.subscribe(new FilterMapObserver(this.p, this.f, observer))
  }
}

class FilterMapObserver<A, B> extends OperatorObserver<A, B> implements Observer<A> {
  private readonly p: (a: A) => boolean
  private readonly f: (a: A) => B

  constructor(p: (a: A) => boolean, f: (a: A) => B, observer: Observer<B>) {
    super(observer)
    this.p = p
    this.f = f
  }

  next(v: A): void {
    const f = this.f
    const p = this.p
    p(v) && this.observer.next(f(v))
  }
}
