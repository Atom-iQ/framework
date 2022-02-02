import { Observable, Observer, PipeableOperator, Subscription } from '../types'
import { OperatorObserver } from '../observer'
import { curry } from '../utils'

export interface SkipOperator {
  (): SkipOperator
  <A>(count: number): PipeableOperator<A, A>
  <A>(count: number, source: Observable<A>): Observable<A>
}

export const skip: SkipOperator = curry(
  <A>(count: number, source: Observable<A>): Observable<A> =>
    count <= 0 ? source : new Skip(count, source)
)

class Skip<A> implements Observable<A> {
  private readonly c: number
  private readonly s: Observable<A>

  constructor(c: number, source: Observable<A>) {
    this.c = c
    this.s = source
  }

  subscribe(observer: Observer<A>): Subscription {
    return this.s.subscribe(new SkipObserver(this.c, observer))
  }
}

class SkipObserver<A> extends OperatorObserver<A, A> implements Observer<A> {
  /** i - index - current emission number */
  private i: number
  /** c - count */
  private readonly c: number

  constructor(c: number, observer: Observer<A>) {
    super(observer)
    this.i = 0
    this.c = c
  }

  next(v: A): void {
    const count = this.c

    if (++this.i > count) this.o.next(v)
  }
}
