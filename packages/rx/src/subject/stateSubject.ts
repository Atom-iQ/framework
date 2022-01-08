import { Subject } from './subject'
import { Observable, Observer, Subscription, Unsubscribable } from '../types'
import { isFunction } from '../utils'

interface NextValueCallback<T> {
  (value: T): T
}

export class StateSubject<T>
  extends Subject<T>
  implements Observable<T>, Observer<T>, Unsubscribable
{
  constructor(private _value: T) {
    super()
  }

  subscribe(observer: Observer<T>): Subscription {
    const subscription = super.subscribe(observer)
    subscription.active && observer.next(this._value)
    return subscription
  }

  get value(): T {
    return this.getValue()
  }

  getValue(): T {
    const { _error, _value } = this
    if (_error) {
      throw _error
    }
    this.throwIfClosed()
    return _value
  }

  next(valueOrCallback: T | NextValueCallback<T>): void {
    if (isFunction(valueOrCallback)) {
      return super.next((this._value = valueOrCallback(this._value)))
    }

    return super.next((this._value = valueOrCallback))
  }
}
