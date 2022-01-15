import { Observable, Observer, SchedulerLike, Subscription } from '../types'
import { SubscriptionGroup } from '../subscription/subscriptionGroup'

export const subscribeOn = <A>(scheduler: SchedulerLike, source: Observable<A>): Observable<A> =>
  new SubscribeOn(scheduler, 0, source)

class SubscribeOn<A> implements Observable<A> {
  private readonly s: SchedulerLike
  private readonly d: number
  private readonly source: Observable<A>

  constructor(s: SchedulerLike, d: number, source: Observable<A>) {
    this.s = s
    this.d = d
    this.source = source
  }

  subscribe(observer: Observer<A>): Subscription {
    const subs = new SubscriptionGroup()
    subs.add(this.s.schedule(() => subs.add(this.source.subscribe(observer))))
    return subs
  }
}
