import { OperatorObserver } from '../../observer'
import { Observable, Observer, Subscription } from '../../types'

export class MapTap<A, B> implements Observable<B> {
  public readonly f: (a: A) => B
  public readonly t: (b: B) => unknown
  /** s - source */
  public readonly s: Observable<A>

  constructor(f: (a: A) => B, t: (b: B) => unknown, source: Observable<A>) {
    this.f = f
    this.t = t
    this.s = source
  }

  subscribe(observer: Observer<B>): Subscription {
    return this.s.subscribe(new MapTapObserver(this.f, this.t, observer))
  }
}

class MapTapObserver<A, B> extends OperatorObserver<A, B> implements Observer<A> {
  private readonly f: (a: A) => B
  private readonly t: (b: B) => unknown

  constructor(f: (a: A) => B, t: (b: B) => unknown, observer: Observer<B>) {
    super(observer)
    this.f = f
    this.t = t
  }

  next(v: A): void {
    const b = this.f(v)
    this.t(b)
    this.o.next(b)
  }
}
