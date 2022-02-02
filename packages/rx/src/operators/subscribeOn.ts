import { Observable, Observer, PipeableOperator, Scheduler, Subscription } from '../types'
import { curry, Curried2 } from '../utils'
import { AsyncAction } from '../scheduler'

export interface SubscribeOnOperator {
  (): SubscribeOnOperator
  <A>(scheduler: Scheduler): PipeableOperator<A, A>
  <A>(scheduler: Scheduler, source: Observable<A>): Observable<A>
}

export const subscribeOn: SubscribeOnOperator = curry(
  <A>(scheduler: Scheduler, source: Observable<A>): Observable<A> =>
    new SubscribeOn(scheduler, 0, source)
)

export interface SubscribeOnWithDelayOperator {
  (): SubscribeOnWithDelayOperator
  <A>(delay: number): Curried2<Scheduler, Observable<A>, Observable<A>>
  <A>(delay: number, scheduler: Scheduler): PipeableOperator<A, A>
  <A>(delay: number, scheduler: Scheduler, source: Observable<A>): Observable<A>
}

export const subscribeOnWithDelay: SubscribeOnWithDelayOperator = curry(
  <A>(delay: number, scheduler: Scheduler, source: Observable<A>): Observable<A> =>
    new SubscribeOn(scheduler, delay, source)
)

type SubscribeOnActionState = {
  s: Observable<never>
  o: Observer<never>
}

class SubscribeOn<A> implements Observable<A> {
  private readonly _s: Scheduler
  private readonly d: number
  private readonly s: Observable<A>

  constructor(s: Scheduler, d: number, source: Observable<A>) {
    this._s = s
    this.d = d
    this.s = source
  }

  subscribe(observer: Observer<A>): Subscription {
    return this._s.schedule(SubscribeOn.W, this.d, { s: this.s, o: observer })
  }

  private static W(this: AsyncAction<SubscribeOnActionState>, state: SubscribeOnActionState) {
    this.add(state.s.subscribe(state.o))
  }
}
