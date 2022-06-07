import { Subscription } from '../types'

import { UnsubscriptionError } from './utils'
import { ChildSub } from './subscription'

export const teardownSub = (teardown: () => void): Subscription => new TeardownSub(teardown)
export const settableTeardownSub = (): SettableTeardownSub => new SettableTeardownSub()

export class TeardownSub extends ChildSub implements Subscription {
  /** t - teardown - function called on unsubscribe */
  protected t: (() => void) | null

  constructor(teardown: () => void) {
    super()
    // Set initial teardown - required
    this.t = teardown
  }

  unsubscribe(): void {
    if (this.a) {
      this.a = false
      this.removeFromParents()
      this.exec()
    }
  }

  protected exec(): void {
    try {
      this.t!()
    } catch (e) {
      throw new UnsubscriptionError([e as Error])
    }
  }
}

export class SettableTeardownSub extends TeardownSub implements Subscription {
  constructor() {
    super(null as unknown as () => void)
  }

  unsubscribe(): void {
    if (this.a) {
      this.a = false
      this.removeFromParents()
      this.t && this.exec()
    }
  }

  set(teardown: (() => void) | null): void {
    this.a && (this.t = teardown)
  }
}
