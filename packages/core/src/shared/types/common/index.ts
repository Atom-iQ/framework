import { Subscription } from 'rxjs'

/**
 * Basic, string indexed object
 */
export interface Dictionary<T> {
  [key: string]: T
}

/**
 * Object with subscription field
 */
export interface WithRxSub {
  subscription?: Subscription
}
