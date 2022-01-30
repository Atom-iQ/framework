import { Observable, observer, SubscriptionGroup } from '@atom-iq/rx'
import { RvdElementNode } from 'types'

export function setClassName(
  isSvg: boolean,
  element: HTMLElement | SVGElement,
  className: string | null
): void {
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

export function connectObservableClassName(
  className: Observable<string | null | undefined>,
  rvdElement: RvdElementNode,
  sub: SubscriptionGroup,
  dom: HTMLElement | SVGElement,
  isSvg: boolean,
  hydrate = false
): void {
  let prev = (rvdElement.className = hydrate ? dom.className : '')
  sub.add(
    className.subscribe(
      observer(
        c => (c || '') !== prev && setClassName(isSvg, dom, (prev = rvdElement.className = c || ''))
      )
    )
  )
}
