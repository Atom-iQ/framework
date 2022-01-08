import { Observable } from '../types'
import { Filter } from './composed/filter'

export function filter<A, B extends A>(p: (a: A) => a is B, source: Observable<A>): Observable<B>
export function filter<A>(p: (a: A) => boolean, source: Observable<A>): Observable<A>
export function filter<A>(p: (a: A) => boolean, source: Observable<A>): Observable<A> {
  return Filter.create(p, source)
}
