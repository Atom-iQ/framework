import { Observable, Observer, PipeableOperator, Subscription } from '../types'
import { empty, isEmptyObservable } from '../observable'
import { OperatorObserver } from '../observer'
import { curry } from '../utils'

export interface DistinctUntilChangedOperator {
  (): DistinctUntilChangedOperator
  <A>(): PipeableOperator<A, A>
  <A>(source: Observable<A>): Observable<A>
}

/**
 * distinctUntilChanged operator
 */
export const distinctUntilChanged: DistinctUntilChangedOperator = curry(
  <A>(source: Observable<A>): Observable<A> => distinctUntilChangedWith(same, source)
)

export interface DistinctUntilChangedWithOperator {
  (): DistinctUntilChangedWithOperator
  <A>(equals: (a1: A, a2: A) => boolean): PipeableOperator<A, A>
  <A>(equals: (a1: A, a2: A) => boolean, source: Observable<A>): Observable<A>
}

/**
 * distinctUntilChangedWith operator
 */
export const distinctUntilChangedWith: DistinctUntilChangedWithOperator = curry(
  <A>(equals: (a1: A, a2: A) => boolean, source: Observable<A>): Observable<A> =>
    isEmptyObservable(source) ? empty() : new DistinctUntilChanged(equals, source)
)

class DistinctUntilChanged<A> implements Observable<A> {
  private readonly e: (a1: A, a2: A) => boolean
  private readonly s: Observable<A>

  constructor(equals: (a1: A, a2: A) => boolean, source: Observable<A>) {
    this.e = equals
    this.s = source
  }

  subscribe(observer: Observer<A>): Subscription {
    return this.s.subscribe(new DistinctUntilChangedObserver(this.e, observer))
  }
}

class DistinctUntilChangedObserver<A> extends OperatorObserver<A, A> implements Observer<A> {
  /** v - value - last value */
  private v?: A
  /** i - init - initial run */
  private i: boolean
  /** e - equals */
  private readonly e: (a1: A, a2: A) => boolean

  constructor(equals: (a1: A, a2: A) => boolean, observer: Observer<A>) {
    super(observer)
    this.e = equals
    this.v = undefined
    this.i = true
  }

  next(v: A): void {
    if (this.i) {
      this.i = false
      this.v = v
      this.o.next(v)
      // TODO: value should be boxed to avoid ! bang
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    } else if (!this.e(this.v!, v)) {
      this.v = v
      this.o.next(v)
    }
  }
}

function same<A>(a: A, b: A): boolean {
  return a === b
}
