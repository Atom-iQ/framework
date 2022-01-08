import { Observable, Observer, Subscription } from '../types'
import { EMPTY_SUB } from '../subscription'

export const empty = (): Observable<never> => EMPTY

export const isEmptyObservable = (observable: Observable<unknown>): boolean => observable === EMPTY

class Empty implements Observable<never> {
  subscribe(observer: Observer<never>): Subscription {
    observer.complete()
    return EMPTY_SUB
  }
}

const EMPTY = new Empty()
