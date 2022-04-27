import { Observable, observer } from '@atom-iq/rx'

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
  isSvg: boolean,
  hydrate = false
): void {
  const dom = rvdElement.dom
  let prev = hydrate ? dom.className : ''
  rvdElement.sub.add(
    className.subscribe(
      observer(
        c => (c || '') !== prev && setClassName(isSvg, dom, (prev = c || ''))
      )
    )
  )
}
