import type { RxSub } from '../../../shared/types'
import { isObservable, Observable } from 'rxjs'

const setClassName = (isSvg: boolean, element: HTMLElement | SVGElement) => (
  className: string | null
) => {
  if (isSvg) {
    if (className) {
      element.setAttribute('class', className)
    } else {
      element.removeAttribute('class')
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;(element as HTMLElement).className = className
  }
}

export const connectClassName = (
  className: string | Observable<string>,
  isSvg: boolean,
  element: HTMLElement | SVGElement,
  propsSubscription: RxSub
): void => {
  if (isObservable(className)) {
    propsSubscription.add(className.subscribe(setClassName(isSvg, element)))
  } else {
    setClassName(isSvg, element)(className)
  }
}
