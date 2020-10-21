import { isObservable, Observable, Subscription } from 'rxjs'

const setClassName = (isSvg: boolean, element: HTMLElement | SVGElement) => (
  className: string | null
): void => {
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
  element: HTMLElement | SVGElement
): Subscription | void => {
  if (isObservable(className)) {
    return className.subscribe(setClassName(isSvg, element))
  } else {
    return setClassName(isSvg, element)(className)
  }
}
