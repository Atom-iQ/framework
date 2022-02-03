import { isFunction } from '@atom-iq/fx'

import { Subscription, Unsubscribable } from '../types'

export function isSubscription(value: unknown): value is Subscription {
  return isUnsubscribable(value) && isFunction((value as Subscription).addParent)
}

export function isUnsubscribable(value: unknown): value is Unsubscribable {
  return !!value && isFunction((value as Unsubscribable).unsubscribe)
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
    this.stack = `${this.stack}${this.errors.reduce(formatErrorStack, '')}`
  }
}

UnsubscriptionError.prototype = Object.create(Error.prototype)

const formatErrorStack = (s: string, e: Error, i: number): string => s + `\n[${i + 1}] ${e.stack}`
