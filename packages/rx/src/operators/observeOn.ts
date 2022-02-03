import { curry, Curried2 } from '@atom-iq/fx'

import {
  Observable,
  Observer,
  ParentSubscription,
  PipeableOperator,
  Scheduler,
  Subscription
} from '../types'
import { GroupSub } from '../subscription'
import { OperatorObserver } from '../observer'
import { AsyncAction, asyncScheduler } from '../scheduler'

export interface ObserveOnOperator {
  (): ObserveOnOperator
  <A>(scheduler: Scheduler): PipeableOperator<A, A>
  <A>(scheduler: Scheduler, source: Observable<A>): Observable<A>
}

export const observeOn: ObserveOnOperator = curry(
  <A>(scheduler: Scheduler, source: Observable<A>): Observable<A> =>
    new ObserveOn(0, scheduler, source)
)

export interface DelayOperator {
  (): DelayOperator
  <A>(delay: number): PipeableOperator<A, A>
  <A>(delay: number, source: Observable<A>): Observable<A>
}

export const delay: DelayOperator = curry(
  <A>(delay: number, source: Observable<A>): Observable<A> =>
    new ObserveOn(delay, asyncScheduler, source)
)

export interface DelayOnOperator {
  (): DelayOnOperator
  <A>(delay: number): Curried2<Scheduler, Observable<A>, Observable<A>>
  <A>(delay: number, scheduler: Scheduler): PipeableOperator<A, A>
  <A>(delay: number, scheduler: Scheduler, source: Observable<A>): Observable<A>
}

export const delayOn: DelayOnOperator = curry(
  <A>(delay: number, scheduler: Scheduler, source: Observable<A>): Observable<A> =>
    new ObserveOn(delay, scheduler, source)
)

class ObserveOn<A> implements Observable<A> {
  private readonly d: number
  private readonly _s: Scheduler
  private readonly s: Observable<A>

  constructor(delay: number, s: Scheduler, source: Observable<A>) {
    this.d = delay
    this._s = s
    this.s = source
  }

  subscribe(observer: Observer<A>): Subscription {
    const sub: ParentSubscription = new GroupSub()
    sub.add(this.s.subscribe(new ObserveOnObserver<A>(sub, this.d, this._s, observer)))
    return sub
  }
}

type ObserveOnActionState = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  o: Observer<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  v: any
}

class ObserveOnObserver<A> extends OperatorObserver<A, A> implements Observer<A> {
  private readonly s: ParentSubscription
  private readonly d: number
  /** _s - scheduler */
  private readonly _s: Scheduler

  constructor(sub: ParentSubscription, delay: number, scheduler: Scheduler, observer: Observer<A>) {
    super(observer)
    this.s = sub
    this.d = delay
    this._s = scheduler
  }

  next(v: A): void {
    this.s.add(this._s.schedule(ObserveOnObserver.W, this.d, { o: this.o, v }))
  }

  private static W(this: AsyncAction<ObserveOnActionState>, state: ObserveOnActionState) {
    state.o.next(state.v)
    this.a = false
    this.removeFromParents()
  }
}
