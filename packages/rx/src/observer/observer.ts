import { noop } from '@atom-iq/fx'

import { Observer, PartialObserver } from '../types'

export const observer = <T>(
  next?: (v: T) => void,
  error?: (e: Error) => void,
  complete?: () => void
): Observer<T> => new SafeObserver(next, error, complete)

export const partialObserver = <T>(observer: PartialObserver<T>): Observer<T> =>
  new SafeObserver(
    observer.next && ((v: T) => observer.next!(v)),
    observer.error && ((e: Error) => observer.error!(e)),
    observer.complete && (() => observer.complete!())
  )

export class SafeObserver<T> implements Observer<T> {
  private o: Observer<T> | null

  constructor(next?: (v: T) => void, error?: (e: Error) => void, complete?: () => void) {
    this.o = {
      next: next || noop,
      error: error || noop,
      complete: complete || noop
    }
  }

  next(v: T): void {
    const observer = this.o
    observer && observer.next(v)
  }

  error(e: Error): void {
    const observer = this.o
    if (observer) {
      this.o = null
      observer.error(e)
    }
  }

  complete(): void {
    const observer = this.o
    if (observer) {
      this.o = null
      observer.complete()
    }
  }
}
