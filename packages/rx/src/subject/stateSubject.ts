import { Subject } from './subject'
import { Observable, Observer, Subscription, Unsubscribable } from '../types'

export const stateSubject = <T>(initialValue: T): StateSubject<T> =>
  new StateSubject<T>(initialValue)

export class StateSubject<T>
  extends Subject<T>
  implements Observable<T>, Observer<T>, Unsubscribable
{
  constructor(private v: T) {
    super()
  }

  subscribe(observer: Observer<T>): Subscription {
    const subscription = super.subscribe(observer)
    subscription.active && observer.next(this.v)
    return subscription
  }

  get value(): T {
    return this.getValue()
  }

  getValue(): T {
    const { _error, v } = this
    if (_error) {
      throw _error
    }
    this.throwIfClosed()
    return v
  }

  next(value: T): void {
    return super.next((this.v = value))
  }
}
