import { Observable, Subscription } from '@atom-iq/rx'

/**
 * Object with subscription field
 */
export interface WithRxSub {
  sub?: Subscription
}

export type StaticOrObservable<T> = T | Observable<T>
