import { Subscription, Observer } from '../types'
import { Subject } from '../subject'

import { ChildSub } from './subscription'

export const subjectSub = <T>(subject: Subject<T>, observer: Observer<T>): Subscription =>
  new SubjectSub(subject, observer)

export class SubjectSub<T> extends ChildSub implements Subscription {
  /** s - subject - reference to subject */
  private readonly s: Subject<T>
  /** o - observer */
  private readonly o: Observer<T>

  constructor(subject: Subject<T>, observer: Observer<T>) {
    super()
    this.s = subject
    this.o = observer
  }

  unsubscribe(): void {
    if (this.a) {
      this.a = false

      this.removeFromParents()
      this.s._removeObserver(this.o)
    }
  }
}
