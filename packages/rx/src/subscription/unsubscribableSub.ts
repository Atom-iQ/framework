import { Subscription, Unsubscribable } from '../types'

import { ChildSub } from './subscription'
import { UnsubscriptionError } from './utils'

export const unsubscribableSub = (unsubscribable: Unsubscribable): Subscription =>
  new UnsubscribableSub(unsubscribable)

export const settableUnsubscribableSub = (): SettableUnsubscribableSub =>
  new SettableUnsubscribableSub()

export class UnsubscribableSub extends ChildSub implements Subscription {
  private readonly u: Unsubscribable
  constructor(unsubscribable: Unsubscribable) {
    super()
    this.u = unsubscribable
  }

  unsubscribe(): void {
    if (this.a) {
      this.a = false
      this.removeFromParents()
      try {
        this.u.unsubscribe()
      } catch (e) {
        throw new UnsubscriptionError(e instanceof UnsubscriptionError ? e.errors : [e as Error])
      }
    }
  }
}

export class SettableUnsubscribableSub extends ChildSub implements Subscription {
  private u: Unsubscribable | null
  constructor() {
    super()
    this.u = null
  }

  unsubscribe(): void {
    if (this.a) {
      this.a = false
      this.removeFromParents()
      if (this.u) {
        try {
          this.u.unsubscribe()
        } catch (e) {
          throw new UnsubscriptionError(e instanceof UnsubscriptionError ? e.errors : [e as Error])
        }
      }
    }
  }

  set(unsubscribable: Unsubscribable): void {
    this.a && (this.u = unsubscribable)
  }
}
