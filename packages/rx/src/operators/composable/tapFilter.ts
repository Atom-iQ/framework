import { Observable, Observer, Subscription } from '../../types'
import { OperatorObserver } from '../../observer'

export class TapFilter<A> implements Observable<A> {
  public readonly f: (a: A) => unknown
  public readonly p: (a: A) => boolean
  /** s - source */
  public readonly s: Observable<A>

  constructor(f: (a: A) => unknown, p: (a: A) => boolean, source: Observable<A>) {
    this.f = f
    this.p = p
    this.s = source
  }

  subscribe(observer: Observer<A>): Subscription {
    return this.s.subscribe(new TapFilterObserver(this.f, this.p, observer))
  }
}

class TapFilterObserver<A> extends OperatorObserver<A, A> implements Observer<A> {
  private readonly f: (a: A) => unknown
  private readonly p: (a: A) => boolean

  constructor(f: (a: A) => unknown, p: (a: A) => boolean, observer: Observer<A>) {
    super(observer)
    this.f = f
    this.p = p
  }

  next(v: A): void {
    this.f(v)
    this.p(v) && this.o.next(v)
  }
}
