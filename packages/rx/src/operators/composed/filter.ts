import { OperatorObserver } from '../../observer'
import { Observable, Observer, Subscription } from '../../types'
import { isEmptyObservable } from '../../observable'

export class Filter<A> implements Observable<A> {
  public readonly p: (a: A) => boolean
  public readonly source: Observable<A>

  constructor(p: (a: A) => boolean, source: Observable<A>) {
    this.p = p
    this.source = source
  }

  subscribe(observer: Observer<A>): Subscription {
    return this.source.subscribe(new FilterObserver(this.p, observer))
  }

  static create<A>(p: (a: A) => boolean, source: Observable<A>): Observable<A> {
    if (isEmptyObservable(source)) {
      return source
    }

    if (source instanceof Filter) {
      return new Filter(and(source.p, p), source.source)
    }

    return new Filter(p, source)
  }
}

class FilterObserver<A> extends OperatorObserver<A, A> implements Observer<A> {
  private readonly p: (a: A) => boolean

  constructor(p: (a: A) => boolean, observer: Observer<A>) {
    super(observer)
    this.p = p
  }

  next(v: A): void {
    const p = this.p
    p(v) && this.observer.next(v)
  }
}

const and =
  <A>(p: (a: A) => boolean, q: (a: A) => boolean) =>
  (x: A): boolean =>
    p(x) && q(x)
