import { isFunction } from '@atom-iq/fx'

import { Observable } from '../types'

export const isObservable = <T>(value: unknown): value is Observable<T> =>
  !!(value && isFunction((value as Observable<T>).subscribe))
