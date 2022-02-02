import { Subscription, ParentSubscription } from '../types'
import { arrRemove } from '../utils'

import { isUnsubscribable } from './utils'

/**
 * Base class for subscription classes, every instance of Subscription,
 * could be added as ChildSubscription
 */
export abstract class ChildSub implements Subscription {
  /** a - active */
  public a: boolean
  /** p - parentage - parent, parents or null */
  protected p: ParentSubscription | ParentSubscription[] | null

  protected constructor() {
    this.a = true
    this.p = null
  }

  abstract unsubscribe(): void

  hasParent(parent: ParentSubscription): boolean {
    const parentage = this.p
    return (
      !!parentage &&
      (isUnsubscribable(parentage) ? parentage === parent : parentage.includes(parent))
    )
  }

  addParent(parent: ParentSubscription): void {
    const parentage = this.p

    if (isUnsubscribable(parentage)) {
      this.p = [parentage, parent]
    } else if (parentage) {
      parentage.push(parent)
    } else {
      this.p = parent
    }
  }

  removeParent(parent: ParentSubscription): void {
    const parentage = this.p

    if (isUnsubscribable(parentage)) {
      this.p = null
    } else {
      arrRemove(parentage, parent)
      if (parentage && parentage.length === 1) this.p = parentage[0]
    }
  }

  removeFromParents(): void {
    const parentage = this.p

    if (isUnsubscribable(parentage)) {
      parentage.remove(this)
    } else if (parentage) {
      for (const parent of parentage) {
        parent.remove(this)
      }
    }
  }
}

export const EMPTY_SUB = new (class EmptySub extends ChildSub implements Subscription {
  constructor() {
    super()
    this.a = false
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unsubscribe(): void {}
})()
