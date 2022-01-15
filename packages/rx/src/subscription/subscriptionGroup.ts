import { ParentSubscription, Subscription } from '../types'
import { ChildSubscription, UnsubscriptionError } from './subscription'

export class SubscriptionGroup extends ChildSubscription implements ParentSubscription {
  protected children: Set<Subscription> | null

  constructor(initial?: Subscription[]) {
    super()
    if (initial) this.children = new Set(initial)
    else this.children = null
  }

  unsubscribe(): void {
    if (this.active) {
      this.active = false

      this.removeFromParents()

      let errors: Error[] | undefined

      const { children } = this
      if (children) {
        this.children = null
        for (const sub of children) {
          try {
            sub.unsubscribe()
          } catch (err) {
            errors = errors ?? []
            if (err instanceof UnsubscriptionError) {
              errors = [...errors, ...err.errors]
            } else {
              errors.push(err as Error)
            }
          }
        }
      }
      if (errors) {
        throw new UnsubscriptionError(errors)
      }
    }
  }

  add(subscription: Subscription): void {
    if (subscription && subscription !== this) {
      if (this.active) {
        if (!subscription.active || subscription.hasParent(this)) {
          return
        }
        subscription.addParent(this)
        this.children = this.children
          ? this.children.add(subscription)
          : new Set<Subscription>([subscription])
      } else {
        subscription.unsubscribe()
      }
    }
  }

  remove(subscription: Subscription): void {
    this.children && this.children.delete(subscription)
    subscription.removeParent(this)
  }
}
