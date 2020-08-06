import { RxSub } from '../rxjs'
export * from './custom-map'

export type TOrTInCallback<T, R = void> = T | ((arg: T) => R);
export interface Dictionary<T> {
  [key: string]: T
}

export interface WithRxSub {
  subscription?: RxSub
}
