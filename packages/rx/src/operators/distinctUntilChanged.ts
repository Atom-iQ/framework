import { Observable, Observer, Subscription } from '../types'
import { empty, isEmptyObservable } from '../observable'
import { OperatorObserver } from '../observer'

export const distinctUntilChanged = <A>(source: Observable<A>): Observable<A> =>
  distinctUntilChangedWith(same, source)

export const distinctUntilChangedWith = <A>(
  equals: (a1: A, a2: A) => boolean,
  source: Observable<A>
): Observable<A> => (isEmptyObservable(source) ? empty() : new DistinctUntilChanged(equals, source))

class DistinctUntilChanged<A> implements Observable<A> {
  private readonly equals: (a1: A, a2: A) => boolean
  private readonly source: Observable<A>

  constructor(equals: (a1: A, a2: A) => boolean, source: Observable<A>) {
    this.equals = equals
    this.source = source
  }

  subscribe(observer: Observer<A>): Subscription {
    return this.source.subscribe(new DistinctUntilChangedObserver(this.equals, observer))
  }
}

class DistinctUntilChangedObserver<A> extends OperatorObserver<A, A> implements Observer<A> {
  private value?: A
  private init: boolean
  private readonly equals: (a1: A, a2: A) => boolean

  constructor(equals: (a1: A, a2: A) => boolean, observer: Observer<A>) {
    super(observer)
    this.equals = equals
    this.value = undefined
    this.init = true
  }

  next(v: A): void {
    if (this.init) {
      this.init = false
      this.value = v
      this.observer.next(v)
      // TODO: value should be boxed to avoid ! bang
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    } else if (!this.equals(this.value!, v)) {
      this.value = v
      this.observer.next(v)
    }
  }
}

function same<A>(a: A, b: A): boolean {
  return a === b
}
