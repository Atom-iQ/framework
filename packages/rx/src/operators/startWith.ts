import { Curried2, Curried3, curry } from '@atom-iq/fx'

import { Observable, Observer, PipeableOperator, Scheduler, Subscription } from '../types'
import { AsyncAction } from '../scheduler'

export interface StartWithOperator {
  (): StartWithOperator
  // 1 Arg
  <A>(initialValue: A): PipeableOperator<A, A>
  <A, B>(initialValue: A): PipeableOperator<A, A | B>
  // 2 Args
  <A>(initialValue: A, source: Observable<A>): Observable<A>
  <A, B>(initialValue: A, source: Observable<B>): Observable<A | B>
}

export const startWith: StartWithOperator = curry(
  <A>(initialValue: A, source: Observable<A>): Observable<A> => new StartWith(initialValue, source)
)

export interface StartWithOnOperator {
  (): StartWithOnOperator
  // 1 Arg
  <A>(initialValue: A): Curried2<Scheduler, Observable<A>, Observable<A>>
  <A, B>(initialValue: A): Curried2<Scheduler, Observable<B>, Observable<A | B>>
  // 2 Args
  <A>(initialValue: A, scheduler: Scheduler): PipeableOperator<A, A>
  <A, B>(initialValue: A, scheduler: Scheduler): PipeableOperator<A, A | B>
  // 3 Args
  <A>(initialValue: A, scheduler: Scheduler, source: Observable<A>): Observable<A>
  <A, B>(initialValue: A, scheduler: Scheduler, source: Observable<B>): Observable<A | B>
}

export const startWithOn: StartWithOnOperator = curry(
  <A>(initialValue: A, scheduler: Scheduler, source: Observable<A>): Observable<A> =>
    new StartWithOn(initialValue, scheduler, 0, source)
)

export interface StartWithOnDelayOperator {
  (): StartWithOnDelayOperator
  // 1 Arg
  <A>(initialValue: A): Curried3<Scheduler, number, Observable<A>, Observable<A>>
  <A, B>(initialValue: A): Curried3<Scheduler, number, Observable<B>, Observable<A | B>>
  // 2 Args
  <A>(initialValue: A, scheduler: Scheduler): Curried2<number, Observable<A>, Observable<A>>
  <A, B>(initialValue: A, scheduler: Scheduler): Curried2<number, Observable<B>, Observable<A | B>>
  // 3 Args
  <A>(initialValue: A, scheduler: Scheduler, delay: number): PipeableOperator<A, A>
  <A, B>(initialValue: A, scheduler: Scheduler, delay: number): PipeableOperator<A, A | B>
  // 4 Args
  <A>(initialValue: A, scheduler: Scheduler, delay: number, source: Observable<A>): Observable<A>
  <A, B>(initialValue: A, scheduler: Scheduler, delay: number, source: Observable<B>): Observable<
    A | B
  >
}

export const startWithOnDelay: StartWithOnDelayOperator = curry(
  <A>(initialValue: A, scheduler: Scheduler, delay: number, source: Observable<A>): Observable<A> =>
    new StartWithOn(initialValue, scheduler, delay, source)
)

class StartWith<A> implements Observable<A> {
  private readonly v: A
  private readonly s: Observable<A>

  constructor(initialValue: A, source: Observable<A>) {
    this.v = initialValue
    this.s = source
  }

  subscribe(observer: Observer<A>): Subscription {
    observer.next(this.v)
    return this.s.subscribe(observer)
  }
}

type StartWithOnActionState = {
  s: Observable<never>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  o: Observer<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  v: any
}

class StartWithOn<A> implements Observable<A> {
  private readonly v: A
  private readonly _s: Scheduler
  private readonly d: number
  private readonly s: Observable<A>

  constructor(initialValue: A, scheduler: Scheduler, delay: number, source: Observable<A>) {
    this.v = initialValue
    this.d = delay
    this._s = scheduler
    this.s = source
  }

  subscribe(observer: Observer<A>): Subscription {
    return this._s.schedule(StartWithOn.W, this.d, { s: this.s, o: observer, v: this.v })
  }

  private static W(this: AsyncAction<StartWithOnActionState>, state: StartWithOnActionState) {
    const observer = state.o
    observer.next(state.v)
    this.add(state.s.subscribe(observer))
  }
}
