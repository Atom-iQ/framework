import { Subscription } from 'rxjs'

export interface Dictionary<T> {
  [key: string]: T
}

export interface WithRxSub {
  subscription?: Subscription
}
