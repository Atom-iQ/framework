import { OperatorObserver } from '../../observer'
import { Observable, Observer, Subscription } from '../../types'

export class MapFilter<A, B> implements Observable<B> {
  public readonly f: (a: A) => B
  public readonly p: (b: B) => boolean
  /** s - source */
  public readonly s: Observable<A>

  constructor(f: (a: A) => B, p: (b: B) => boolean, source: Observable<A>) {
    this.f = f
    this.p = p
    this.s = source
  }

  subscribe(observer: Observer<B>): Subscription {
    return this.s.subscribe(new MapFilterObserver(this.f, this.p, observer))
  }
}

class MapFilterObserver<A, B> extends OperatorObserver<A, B> implements Observer<A> {
  private readonly f: (a: A) => B
  private readonly p: (b: B) => boolean

  constructor(f: (a: A) => B, p: (b: B) => boolean, observer: Observer<B>) {
    super(observer)
    this.f = f
    this.p = p
  }

  next(v: A): void {
    const b = this.f(v)
    this.p(b) && this.o.next(b)
  }
}
