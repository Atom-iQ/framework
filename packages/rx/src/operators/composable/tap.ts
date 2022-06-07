import { Observable, Observer, Subscription } from '../../types'
import { OperatorObserver } from '../../observer'

export class Tap<A> implements Observable<A> {
  public readonly f: (a: A) => unknown
  public readonly s: Observable<A>

  constructor(f: (a: A) => unknown, source: Observable<A>) {
    this.f = f
    this.s = source
  }

  subscribe(observer: Observer<A>): Subscription {
    return this.s.subscribe(new TapObserver(this.f, observer))
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
    this.o.next(v)
  }
}
