import { EMPTY_SUB, subjectSub } from '../subscription'
import { Observable, Observer, Subscription, Unsubscribable } from '../types'
import { arrRemove } from '../utils'

import { unsubscribedError } from './utils'

export const subject = <T>(): Subject<T> => new Subject<T>()
/**
 * A Subject is a special type of Observable that allows values to be
 * multicasted to many Observers. Subjects are like EventEmitters.
 *
 * Every Subject is an Observable and an Observer. You can subscribe to a
 * Subject, and you can call next to feed values as well as error and complete.
 */
export class Subject<T> implements Observable<T>, Observer<T>, Unsubscribable {
  /**
   * o - observers
   *
   * Array of observers connected to the subject.
   * If it's null, it means that subject has finished
   */
  protected o: Observer<T>[] | null
  /** e - error - reference to error thrown during subject */
  protected e: Error | boolean

  constructor() {
    this.o = []
    this.e = false
  }

  next(value: T): void {
    const observers = this.o
    if (observers) {
      for (const observer of observers.slice()) {
        observer.next(value)
      }
    } else if (this.e === true) throw unsubscribedError()
  }

  error(error: Error): void {
    const observers = this.o
    if (observers) {
      this.o = null
      this.e = error
      for (const observer of observers) {
        observer.error(error)
      }
    } else if (this.e === true) throw unsubscribedError()
  }

  complete(): void {
    const observers = this.o
    if (observers) {
      this.o = null
      for (const observer of observers) {
        observer.complete()
      }
    } else if (this.e === true) throw unsubscribedError()
  }

  unsubscribe(): void {
    this.o = null
    this.e = true
  }

  subscribe(observer: Observer<T>): Subscription {
    if (this.isStopped(observer)) return EMPTY_SUB

    this.o!.push(observer)
    return subjectSub(this, observer)
  }

  /**
   * @internal don not use
   *
   * Helper for removing observers outside of Subject class - in subject subscription
   */
  _removeObserver(observer: Observer<T>): void {
    arrRemove(this.o, observer)
  }

  protected isStopped(observer: Observer<T>): boolean {
    if (this.e === true) throw unsubscribedError()
    if (this.e) {
      observer.error(this.e as Error)
      return true
    }
    if (!this.o) {
      observer.complete()
      return true
    }
    return false
  }
}
