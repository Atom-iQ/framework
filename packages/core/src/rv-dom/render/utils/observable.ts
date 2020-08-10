import {Observable} from 'rxjs'
import { RxO, WithRxSub } from '@@types'

export function nullObservable(): RxO<null> {
  return syncObservable<null>(null)
}

export function syncObservable<T>(from: T): RxO<T> {
  return new Observable<T>(observer => {
    observer.next(from)
    observer.complete()
  })
}

export function unsubscribe(withSub: WithRxSub): void {
  if (withSub.subscription) {
    withSub.subscription.unsubscribe()
  }
}
