import { Head, Pipeable, Tail } from './types'

export const withRest =
  <P extends any[], R>(
    fn: (a: Head<P>, ...restArgs: Tail<P>) => R,
    ...args: Tail<P>
  ): Pipeable<Head<P>, R> =>
  a =>
    fn(a, ...args)
