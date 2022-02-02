import { Observable, PipeableOperator } from '../types'
import { curry } from '../utils'

import { composeFilter } from './composable/compose'

export interface FilterOperator {
  // 0 args
  (): FilterOperator
  // 1 arg
  <A, B extends A>(p: (a: A) => a is B): PipeableOperator<A, B>
  <A>(p: (a: A) => boolean): PipeableOperator<A, A>
  <A>(p: (a: A) => boolean): PipeableOperator<A, A>
  // 2 args
  <A, B extends A>(p: (a: A) => a is B, source: Observable<A>): Observable<B>
  <A>(p: (a: A) => boolean, source: Observable<A>): Observable<A>
  <A>(p: (a: A) => boolean, source: Observable<A>): Observable<A>
}

export const filter: FilterOperator = curry(
  <A>(p: (a: A) => boolean, source: Observable<A>): Observable<A> => composeFilter(p, source)
)
