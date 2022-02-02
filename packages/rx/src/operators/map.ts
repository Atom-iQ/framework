import { Observable, PipeableOperator } from '../types'
import { curry } from '../utils'

import { composeMap } from './composable'

export interface MapOperator {
  (): MapOperator
  <A, B>(f: (a: A) => B): PipeableOperator<A, B>
  <A, B>(f: (a: A) => B, source: Observable<A>): Observable<B>
}

export const map: MapOperator = curry(
  <A, B>(f: (a: A) => B, source: Observable<A>): Observable<B> => composeMap(f, source)
)

export interface MapToOperator {
  (): MapToOperator
  <A, B>(v: B): PipeableOperator<A, B>
  <A, B>(v: B, source: Observable<A>): Observable<B>
}

export const mapTo: MapToOperator = curry(
  <A, B>(v: B, source: Observable<A>): Observable<B> => composeMap(() => v, source)
)
