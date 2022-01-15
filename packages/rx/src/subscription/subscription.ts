import { Subscription, ParentSubscription } from '../types'
import { isFunction } from '../utils'

/**
 * Base class for subscription classes, every instance of Subscription,
 * could be added as ChildSubscription
 */
export abstract class ChildSubscription implements Subscription {
  public active: boolean
  protected parentage: ParentSubscription | Set<ParentSubscription> | undefined

  protected constructor() {
    this.active = true
  }

  abstract unsubscribe(): void

  hasParent(parent: ParentSubscription): boolean {
    return (this.parentage &&
      (isSubscription(this.parentage)
        ? this.parentage === parent
        : this.parentage.has(parent))) as boolean
  }

  addParent(parent: ParentSubscription): void {
    if (this.parentage) {
      if (isSubscription(this.parentage)) {
        if (this.parentage !== parent) {
          this.parentage = new Set([parent])
        }
      } else {
        this.parentage.add(parent)
      }
    } else {
      this.parentage = parent
    }
  }

  removeParent(parent: ParentSubscription): void {
    if (this.parentage) {
      if (isSubscription(this.parentage)) {
        this.parentage = undefined
      } else {
        this.parentage.delete(parent)
        if (this.parentage.size === 0) {
          this.parentage = undefined
        }
      }
    }
  }

  removeFromParents(): void {
    if (this.parentage) {
      if (isSubscription(this.parentage)) {
        this.parentage.remove(this)
      } else {
        for (const parent of this.parentage) {
          parent.remove(this)
        }
      }
    }
  }
}

export class TeardownSubscription extends ChildSubscription implements Subscription {
  private readonly teardown?: () => void

  constructor(teardown?: () => void) {
    super()
    this.teardown = teardown
  }

  unsubscribe(): void {
    if (this.active) {
      this.active = false

      this.removeFromParents()

      if (this.teardown) {
        try {
          this.teardown()
        } catch (e) {
          throw new UnsubscriptionError(e instanceof UnsubscriptionError ? e.errors : [e as Error])
        }
      }
    }
  }
}

class EmptySubscription extends ChildSubscription implements Subscription {
  constructor() {
    super()
    this.active = false
  }
  unsubscribe(): void {
    return void 0
  }
}

export const EMPTY_SUB = new EmptySubscription()

export function isSubscription(value: unknown): value is Subscription {
  return (value &&
    'active' in (value as Subscription) &&
    isFunction((value as Subscription).unsubscribe)) as boolean
}

export class UnsubscriptionError implements Error {
  public readonly name: string
  public readonly stack?: string
  public readonly message: string
  public readonly errors: Error[]

  constructor(errors: Error[]) {
    this.name = 'UnsubscriptionError'
    this.message = ''
    this.errors = errors
    Error.call(this)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnsubscriptionError)
    }
    this.stack = `${this.stack}${formatErrorStacks(this.errors)}`
  }
}

UnsubscriptionError.prototype = Object.create(Error.prototype)

const formatErrorStacks = (errors: Error[]): string => errors.reduce(formatErrorStack, '')

const formatErrorStack = (s: string, e: Error, i: number): string => s + `\n[${i + 1}] ${e.stack}`
