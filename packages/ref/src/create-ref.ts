import type { ElementRefProp, ElementRef, ComponentRef, ComponentRefProp } from '@atom-iq/core'
import { Subject } from 'rxjs'

import type { ComponentRefTuple, ElementRefTuple } from './types'

export const elementRef = (controlProps?: string[], getEvents?: string[]): ElementRefTuple => {
  const refSubject = new Subject<ElementRef>()

  const connectRef = (): ElementRefProp => {
    const fn = (ref: ElementRef) => refSubject.next(ref)
    fn.controlProps = controlProps
    fn.getEvents = getEvents
    fn.complete = () => refSubject.complete()
    return fn
  }

  return [refSubject.asObservable(), connectRef]
}

export const componentRef = (): ComponentRefTuple => {
  const refSubject = new Subject<ComponentRef>()

  const connectRef = (): ComponentRefProp => (ref: ComponentRef) => refSubject.next(ref)

  return [refSubject.asObservable(), connectRef]
}
