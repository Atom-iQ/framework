import { Observable, Observer, PipeableOperator, Subscription } from '../types'
import { OperatorObserver } from '../observer'
import { curry, Curried2 } from '../utils'

export interface ScanOperator {
  (): ScanOperator
  <A, B>(f: (acc: B, v: A) => B): Curried2<B, Observable<A>, Observable<B>>
  <A, B>(f: (acc: B, v: A) => B, initial: B): PipeableOperator<A, B>
  <A, B>(f: (acc: B, v: A) => B, initial: B, source: Observable<A>): Observable<B>
}

export const scan: ScanOperator = curry(
  <A, B>(f: (acc: B, v: A) => B, initial: B, source: Observable<A>): Observable<B> =>
    new Scan(f, initial, source)
)

export type ReduceOperator = ScanOperator

export const reduce: ReduceOperator = curry(
  <A, B>(f: (acc: B, v: A) => B, initial: B, source: Observable<A>): Observable<B> =>
    new Reduce(f, initial, source)
)

class Scan<A, B> implements Observable<B> {
  private readonly f: (b: B, a: A) => B
  private readonly v: B
  private readonly s: Observable<A>

  constructor(f: (b: B, a: A) => B, v: B, source: Observable<A>) {
    this.f = f
    this.v = v
    this.s = source
  }

  subscribe(observer: Observer<B>): Subscription {
    observer.next(this.v)
    return this.s.subscribe(new ScanObserver(this.f, this.v, observer))
  }
}

class ScanObserver<A, B> extends OperatorObserver<A, B> implements Observer<A> {
  private readonly f: (b: B, a: A) => B
  private v: B

  constructor(f: (b: B, a: A) => B, v: B, observer: Observer<B>) {
    super(observer)
    this.f = f
    this.v = v
  }

  next(v: A): void {
    this.o.next((this.v = this.f(this.v, v)))
  }
}

class Reduce<A, B> implements Observable<B> {
  private readonly f: (b: B, a: A) => B
  private readonly v: B
  private readonly s: Observable<A>

  constructor(f: (b: B, a: A) => B, v: B, source: Observable<A>) {
    this.f = f
    this.v = v
    this.s = source
  }

  subscribe(observer: Observer<B>): Subscription {
    return this.s.subscribe(new ReduceObserver(this.f, this.v, observer))
  }
}

class ReduceObserver<A, B> extends OperatorObserver<A, B> implements Observer<A> {
  private readonly f: (b: B, a: A) => B
  private v: B

  constructor(f: (b: B, a: A) => B, v: B, observer: Observer<B>) {
    super(observer)
    this.f = f
    this.v = v
  }

  next(v: A): void {
    this.v = this.f(this.v, v)
  }

  complete() {
    const observer = this.o
    observer.next(this.v)
    observer.complete()
  }
}
