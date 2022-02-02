import { OperatorObserver } from '../../observer'
import { Observable, Observer, Subscription } from '../../types'

export class Map<A, B> implements Observable<B> {
  public readonly f: (a: A) => B
  /** s - source */
  public readonly s: Observable<A>

  constructor(f: (a: A) => B, source: Observable<A>) {
    this.f = f
    this.s = source
  }

  subscribe(observer: Observer<B>): Subscription {
    return this.s.subscribe(new MapObserver(this.f, observer))
  }
}

class MapObserver<A, B> extends OperatorObserver<A, B> implements Observer<A> {
  private readonly f: (a: A) => B

  constructor(f: (a: A) => B, observer: Observer<B>) {
    super(observer)
    this.f = f
  }

  next(v: A): void {
    const f = this.f
    this.o.next(f(v))
  }
}
