import { Observer } from '../types'

export abstract class OperatorObserver<A, B> implements Observer<A> {
  protected readonly observer: Observer<B>
  protected constructor(observer: Observer<B>) {
    this.observer = observer
  }

  abstract next(v: A): void

  error(e: Error): void {
    this.observer.error(e)
  }

  complete(): void {
    this.observer.complete()
  }
}
