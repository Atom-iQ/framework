import { Observable, Observer, Subscription } from '../../types'
import { OperatorObserver } from '../../observer'

export class TapMap<A, B> implements Observable<B> {
  /** t - tap fn */
  public readonly t: (a: A) => unknown
  /** t - map fn */
  public readonly f: (a: A) => B
  /** s - source */
  public readonly s: Observable<A>

  constructor(t: (a: A) => unknown, f: (a: A) => B, source: Observable<A>) {
    this.t = t
    this.f = f
    this.s = source
  }

  subscribe(observer: Observer<B>): Subscription {
    return this.s.subscribe(new TapMapObserver(this.t, this.f, observer))
  }
}

class TapMapObserver<A, B> extends OperatorObserver<A, B> implements Observer<A> {
  private readonly t: (a: A) => unknown
  private readonly f: (a: A) => B

  constructor(t: (a: A) => unknown, f: (a: A) => B, observer: Observer<B>) {
    super(observer)
    this.t = t
    this.f = f
  }

  next(v: A): void {
    this.t(v)
    this.o.next(this.f(v))
  }
}
