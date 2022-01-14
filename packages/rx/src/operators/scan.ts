import { Observable, Observer, Subscription } from '../types'
import { OperatorObserver } from '../observer'

export const scan = <A, B>(
  f: (acc: B, v: A) => B,
  initial: B,
  source: Observable<A>
): Observable<B> => new Scan(f, initial, source)

export const reduce = <A, B>(
  f: (acc: B, v: A) => B,
  initial: B,
  source: Observable<A>
): Observable<B> => new Reduce(f, initial, source)

class Scan<A, B> implements Observable<B> {
  constructor(
    private readonly f: (b: B, a: A) => B,
    private readonly v: B,
    private readonly source: Observable<A>
  ) {}

  subscribe(observer: Observer<B>): Subscription {
    observer.next(this.v)
    return this.source.subscribe(new ScanObserver(this.f, this.v, observer))
  }
}

class ScanObserver<A, B> extends OperatorObserver<A, B> implements Observer<A> {
  constructor(private readonly f: (b: B, a: A) => B, private v: B, observer: Observer<B>) {
    super(observer)
  }

  next(v: A): void {
    this.observer.next((this.v = this.f(this.v, v)))
  }
}

class Reduce<A, B> implements Observable<B> {
  constructor(
    private readonly f: (b: B, a: A) => B,
    private readonly v: B,
    private readonly source: Observable<A>
  ) {}

  subscribe(observer: Observer<B>): Subscription {
    return this.source.subscribe(new ReduceObserver(this.f, this.v, observer))
  }
}

class ReduceObserver<A, B> extends OperatorObserver<A, B> implements Observer<A> {
  constructor(private readonly f: (b: B, a: A) => B, private v: B, observer: Observer<B>) {
    super(observer)
  }

  next(v: A): void {
    this.v = this.f(this.v, v)
  }

  complete() {
    this.observer.next(this.v)
    super.complete()
  }
}
