import { Subscriber } from 'rxjs'
import type { WithRxSub } from '../../../shared/types'

/**
 * Get object with `subscription` property and unsubscribe it
 *
 * @param withSub object with subscription
 */
export function unsubscribe(withSub: WithRxSub): void {
  if (withSub.subscription) {
    withSub.subscription.unsubscribe()
  }
}

/**
 * Create RVD Observer/Subscriber
 *
 * Called rvdObserver, because it's passed to subscriptions and acts as Observer
 * in RVD Renderer, but technically it returns new Subscriber (that's extending
 * Observer). Theoretically, it should speed up a little subscribing to Observables,
 * as we're doing the same transformation, as Observable.subscribe() is doing, when
 * functions or (partial) observer is passed, but without any unnecessary (in our case)
 * checks. Observable subscribe method is checking internally if passed object
 * or first (next) function is subscriber, if not it's creating safe subscriber,
 * that's parsing passed arguments and saving destination. With rvdObserver,
 * it's 100% sure, that subscribe will not create safe subscriber, because we're
 * creating our own safe subscriber.
 *
 * Should be checked in performance benchmarks, if it's improving performance
 * @param next observer's next callback
 * @return RVD Fast Safe Subscriber
 */
export function rvdObserver<T>(next: (nextValue: T) => void): Subscriber<T> {
  /**
   * RVD Safe Subscriber
   */
  return new Subscriber({
    next,
    error: noop, // TODO: Implement error handler
    complete: noop
  })
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}
