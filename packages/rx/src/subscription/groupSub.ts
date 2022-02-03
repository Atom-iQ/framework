import { ParentSubscription, Subscription } from '../types'
import { arrRemove } from '../utils'

import { ChildSub, EMPTY_SUB } from './subscription'
import { UnsubscriptionError } from './utils'

export const groupSub = (initialSubs?: Subscription[]): ParentSubscription =>
  new GroupSub(initialSubs)

export class GroupSub extends ChildSub implements ParentSubscription {
  /** s - subscriptions - all connected children subscriptions */
  protected s: Subscription[]

  constructor(initialSubs?: Subscription[]) {
    super()
    this.s = initialSubs || []
  }

  unsubscribe(): void {
    if (this.a) {
      this.a = false

      this.removeFromParents()

      if (this.s.length) this.unsubscribeChildren()
    }
  }

  protected unsubscribeChildren(): void {
    const errors: Error[] = []

    const subs = this.s
    this.s = []

    for (const sub of subs) {
      try {
        sub.unsubscribe()
      } catch (e) {
        errors.push(...(e instanceof UnsubscriptionError ? e.errors : [e as Error]))
      }
    }

    if (errors.length) throw new UnsubscriptionError(errors)
  }

  add(sub: Subscription): void {
    if (sub !== this && sub !== EMPTY_SUB) {
      if (this.a) {
        if (sub.a && !sub.hasParent(this)) {
          sub.addParent(this)
          this.s.push(sub)
        }
      } else {
        sub.unsubscribe()
      }
    }
  }

  remove(sub: Subscription): void {
    if (sub !== this && sub !== EMPTY_SUB) {
      arrRemove(this.s, sub)
      sub.removeParent(this)
    }
  }
}
