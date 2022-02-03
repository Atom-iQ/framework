import { curry } from '@atom-iq/fx'

import { Observable, Observer, PipeableOperator, Subscription } from '../types'
import { OperatorObserver } from '../observer'
import { empty } from '../observable'

import { filter } from './filter'

export interface TakeOperator {
  (): TakeOperator
  <A>(count: number): PipeableOperator<A, A>
  <A>(count: number, source: Observable<A>): Observable<A>
}

export const take: TakeOperator = curry(
  <A>(count: number, source: Observable<A>): Observable<A> =>
    count <= 0 ? empty() : new Take(count, source)
)

export interface FirstOperator {
  (): FirstOperator
  <A>(): PipeableOperator<A, A>
  <A>(source: Observable<A>): Observable<A>
}

export const first: FirstOperator = curry(
  <A>(source: Observable<A>): Observable<A> => new Take(1, source)
)

export interface LastOperator {
  (): LastOperator
  <A>(): PipeableOperator<A, A>
  <A>(source: Observable<A>): Observable<A>
}

export const last: LastOperator = curry(
  <A>(source: Observable<A>): Observable<A> => new TakeLast(source)
)

export interface FindFirstOperator {
  (): FindFirstOperator
  <A>(p: (a: A) => boolean): PipeableOperator<A, A>
  <A>(p: (a: A) => boolean, source: Observable<A>): Observable<A>
}

export const findFirst: FindFirstOperator = curry(
  <A>(p: (a: A) => boolean, source: Observable<A>): Observable<A> => take(1, filter(p, source))
)

class Take<A> implements Observable<A> {
  private readonly c: number
  private readonly s: Observable<A>

  constructor(c: number, source: Observable<A>) {
    this.c = c
    this.s = source
  }

  subscribe(observer: Observer<A>): Subscription {
    return this.s.subscribe(new TakeObserver(this.c, observer))
  }
}

class TakeObserver<A> extends OperatorObserver<A, A> implements Observer<A> {
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
    if (++this.i <= count) {
      this.o.next(v)

      if (count <= this.i) {
        this.o.complete()
      }
    }
  }
}

class TakeLast<A> implements Observable<A> {
  private readonly s: Observable<A>

  constructor(source: Observable<A>) {
    this.s = source
  }

  subscribe(observer: Observer<A>): Subscription {
    return this.s.subscribe(new TakeLastObserver(observer))
  }
}

class TakeLastObserver<A> extends OperatorObserver<A, A> implements Observer<A> {
  private v: A
  private i: boolean
  constructor(observer: Observer<A>) {
    super(observer)
    this.v = undefined as unknown as A
    this.i = false
  }

  next(v: A): void {
    !this.i && (this.i = true)
    this.v = v
  }

  complete() {
    const observer = this.o
    this.i && observer.next(this.v)
    observer.complete()
  }
}
