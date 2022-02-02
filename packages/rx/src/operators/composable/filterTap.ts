import { OperatorObserver } from '../../observer'
import { Observable, Observer, Subscription } from '../../types'

export class FilterTap<A> implements Observable<A> {
  public readonly p: (a: A) => boolean
  public readonly f: (a: A) => unknown
  /** s - source */
  public readonly s: Observable<A>

  constructor(p: (a: A) => boolean, f: (a: A) => unknown, source: Observable<A>) {
    this.p = p
    this.f = f
    this.s = source
  }

  subscribe(observer: Observer<A>): Subscription {
    return this.s.subscribe(new FilterTapObserver(this.p, this.f, observer))
  }
}

class FilterTapObserver<A> extends OperatorObserver<A, A> implements Observer<A> {
  private readonly p: (a: A) => boolean
  private readonly f: (a: A) => unknown

  constructor(p: (a: A) => boolean, f: (a: A) => unknown, observer: Observer<A>) {
    super(observer)
    this.p = p
    this.f = f
  }

  next(v: A): void {
    if (this.p(v)) {
      this.f(v)
      this.o.next(v)
    }
  }
}
