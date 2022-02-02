import { Subscription, Unsubscribable } from '../types'

import { ChildSub } from './subscription'
import { UnsubscriptionError } from './utils'

export const settableSub = (): SettableSub => new SettableSub()

export class SettableSub extends ChildSub implements Subscription {
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
          throw new UnsubscriptionError([e as Error])
        }
      }
    }
  }

  set(unsubscribable: Unsubscribable): void {
    this.a && (this.u = unsubscribable)
  }
}
