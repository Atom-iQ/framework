import { Observable } from '../types'
import { isFunction } from '../utils'

export const isObservable = <T>(value: unknown): value is Observable<T> =>
  !!(value && isFunction((value as Observable<T>).subscribe))
