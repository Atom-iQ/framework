import { Observer } from '../types'

export abstract class OperatorObserver<A, B> implements Observer<A> {
  /** o - observer */
  protected readonly o: Observer<B>

  protected constructor(observer: Observer<B>) {
    this.o = observer
  }

  abstract next(v: A): void

  error(e: Error): void {
    this.o.error(e)
  }

  complete(): void {
    this.o.complete()
  }
}
