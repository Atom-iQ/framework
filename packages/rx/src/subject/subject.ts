import { EMPTY_SUB, TeardownSubscription } from '../subscription'
import { Observable, Observer, Subscription, Unsubscribable } from '../types'
import { arrRemove } from '../utils'

export const subject = <T>(): Subject<T> => new Subject<T>()
/**
 * A Subject is a special type of Observable that allows values to be
 * multicasted to many Observers. Subjects are like EventEmitters.
 *
 * Every Subject is an Observable and an Observer. You can subscribe to a
 * Subject, and you can call next to feed values as well as error and complete.
 */
export class Subject<T> implements Observable<T>, Observer<T>, Unsubscribable {
  observers: Observer<T>[] | null = []
  public active = true
  public finished = false
  protected _error: Error | null = null

  next(value: T): void {
    this.throwIfClosed()
    if (!this.finished) {
      const observers = this.observers!.slice()
      for (const observer of observers!) {
        observer.next(value)
      }
    }
  }

  error(err: Error): void {
    this.throwIfClosed()
    if (!this.finished) {
      this.finished = true
      this._error = err
      const { observers } = this
      this.observers = null
      for (const observer of observers!) {
        observer.error(err)
      }
    }
  }

  complete(): void {
    this.throwIfClosed()
    if (!this.finished) {
      this.finished = true
      const { observers } = this
      this.observers = null
      for (const observer of observers!) {
        observer.complete()
      }
    }
  }

  unsubscribe(): void {
    this.active = false
    this.finished = true
    this.observers = null
  }

  subscribe(observer: Observer<T>): Subscription {
    this.throwIfClosed()
    if (this._error !== null) {
      observer.error(this._error)
      return EMPTY_SUB
    }
    if (this.finished) {
      observer.complete()
      return EMPTY_SUB
    }
    this.observers!.push(observer)
    return new TeardownSubscription(() => arrRemove(this.observers, observer))
  }

  protected throwIfClosed(): void {
    if (!this.active) {
      throw new Error('Subject already unsubscribed')
    }
  }
}
