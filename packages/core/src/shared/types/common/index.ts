import { Subscription } from 'rxjs'
export * from './custom-map'

export interface Dictionary<T> {
  [key: string]: T
}

export interface WithRxSub {
  subscription?: Subscription
}
