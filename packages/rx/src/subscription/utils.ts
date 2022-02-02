import { Subscription } from '../types'
import { isFunction } from '../utils'

export function isUnsubscribable(value: unknown): value is Subscription {
  return (value && isFunction((value as Subscription).unsubscribe)) as boolean
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
