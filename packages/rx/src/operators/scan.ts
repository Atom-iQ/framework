import { Observable, Observer, Subscription } from '../types'
import { empty } from '../observable'
import { OperatorObserver } from '../observer'

export const scan = <A, B>(
  f: (acc: B, v: A) => B,
  initial: B,
  source: Observable<A>
): Observable<B> => new Scan(f, initial, false, source)

export const reduce = <A, B>(
  f: (acc: B, v: A) => B,
  initial: B,
  source: Observable<A>
): Observable<B> => new Scan(f, initial, true, source)

class Scan<A, B> implements Observable<B> {
  constructor(
    private readonly f: (b: B, a: A) => B,
    private readonly v: B,
    private readonly r: boolean,
    private readonly source: Observable<A>
  ) {}

  subscribe(observer: Observer<B>): Subscription {
    observer.next(this.v)
    return this.source.subscribe(new ScanObserver(this.f, this.v, this.r, observer))
  }
}

class ScanObserver<A, B> extends OperatorObserver<A, B> implements Observer<A> {
  constructor(
    private readonly f: (b: B, a: A) => B,
    private v: B,
    private readonly r: boolean,
    observer: Observer<B>
  ) {
    super(observer)
  }

  next(v: A): void {
    this.v = this.f(this.v, v)
    !this.r && this.observer.next(this.v)
  }

  complete() {
    this.r && this.observer.next(this.v)
    super.complete()
  }
}
