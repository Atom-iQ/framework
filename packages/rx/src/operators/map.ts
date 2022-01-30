import { Observable } from '../types'

import { Map } from './composed/map'

export const map = <A, B>(f: (a: A) => B, source: Observable<A>): Observable<B> =>
  Map.create(f, source)

export const mapTo = <A, B>(v: B, source: Observable<A>): Observable<B> => map(() => v, source)
