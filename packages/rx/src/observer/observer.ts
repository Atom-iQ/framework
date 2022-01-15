import { Observer } from '../types'
import { noop } from '../utils'

export const observer = <T>(
  next?: (v: T) => void,
  error?: (e: Error) => void,
  complete?: () => void
): Observer<T> => new SafeObserver(next, error, complete)

export const partialObserver = <T>(observer: Partial<Observer<T>>): Observer<T> =>
  new SafeObserver(
    observer.next?.bind(observer),
    observer.error?.bind(observer),
    observer.complete?.bind(observer)
  )

export class SafeObserver<T> implements Observer<T> {
  private active: boolean
  private observer: Observer<T>

  constructor(next?: (v: T) => void, error?: (e: Error) => void, complete?: () => void) {
    this.active = true
    this.observer = {
      next: next || noop,
      error: error || noop,
      complete: complete || noop
    }
  }

  next(v: T): void {
    if (this.active) {
      this.observer.next(v)
    }
  }

  error(e: Error): void {
    this.active = false
    this.observer.error(e)
  }

  complete(): void {
    if (this.active) {
      this.active = false
      this.observer.complete()
    }
  }
}
