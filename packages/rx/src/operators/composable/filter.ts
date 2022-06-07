import { OperatorObserver } from '../../observer'
import { Observable, Observer, Subscription } from '../../types'

export class Filter<A> implements Observable<A> {
  /** p - predicate fn */
  public readonly p: (a: A) => boolean
  /** s - source */
  public readonly s: Observable<A>

  constructor(p: (a: A) => boolean, source: Observable<A>) {
    this.p = p
    this.s = source
  }

  subscribe(observer: Observer<A>): Subscription {
    return this.s.subscribe(new FilterObserver(this.p, observer))
  }
}

class FilterObserver<A> extends OperatorObserver<A, A> implements Observer<A> {
  /** p - predicate fn */
  private readonly p: (a: A) => boolean

  constructor(p: (a: A) => boolean, observer: Observer<A>) {
    super(observer)
    this.p = p
  }

  next(v: A): void {
    this.p(v) && this.o.next(v)
  }
}
