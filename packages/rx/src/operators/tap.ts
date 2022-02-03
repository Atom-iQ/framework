import { curry } from '@atom-iq/fx'

import type { Observable, PipeableOperator } from '../types'

import { composeTap } from './composable'

export interface TapOperator {
  (): TapOperator
  <A>(f: (a: A) => unknown): PipeableOperator<A, A>
  <A>(f: (a: A) => unknown, source: Observable<A>): Observable<A>
}

export const tap: TapOperator = curry(
  <A>(f: (a: A) => unknown, source: Observable<A>): Observable<A> => composeTap(f, source)
)
