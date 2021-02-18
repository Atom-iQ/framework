import type { Observable } from 'rxjs'
import { combineLatest, isObservable } from 'rxjs'
import { map } from 'rxjs/operators'

export type IQRxInterpolation = Observable<string | number> | string | number

/**
 * iQRx Expression Tagged Template
 * @param strings
 * @param interpolations
 */
export function iQRx<R>(
  strings: TemplateStringsArray,
  ...interpolations: IQRxInterpolation[]
): Observable<R> {
  const observables = interpolations.filter<Observable<string | number>>(isObservable)
  return combineLatest(observables).pipe(
    map(values => {
      const str = iQRxToString(strings, interpolations)(values)
      return Function('return ' + str + ';')()
    })
  )
}

/**
 * iQRxS String Tagged Template
 * @param strings
 * @param interpolations
 */
export function iQRxS(
  strings: TemplateStringsArray,
  ...interpolations: IQRxInterpolation[]
): Observable<string> {
  const observables = interpolations.filter<Observable<string | number>>(isObservable)
  return combineLatest(observables).pipe(map(iQRxToString(strings, interpolations)))
}

function iQRxToString(
  strings: TemplateStringsArray,
  interpolations: IQRxInterpolation[]
): (values: (string | number)[]) => string {
  return function (values) {
    let str = ''
    for (let i = 0, oi = 0; i < strings.length; ++i) {
      str += strings[i]
      if (i in interpolations) {
        const interpolation = interpolations[i]
        if (isObservable(interpolation)) {
          str += values[oi++]
        } else {
          str += interpolation
        }
      }
    }
    return str
  }
}
