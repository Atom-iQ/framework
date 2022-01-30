import type {
  ElementRef,
  ComponentRef,
  RvdRefObject,
  RvdRefObjectWithObservable
} from '@atom-iq/core'
import { subject } from '@atom-iq/rx'

export const elementRef = (...controlProps: string[]): RvdRefObject<ElementRef> => {
  return {
    current: null,
    __controlProps: controlProps
  }
}

export const observableElementRef = (
  ...controlProps: string[]
): RvdRefObjectWithObservable<ElementRef> => {
  const refSubject = subject()

  return {
    current: null,
    current$: refSubject,
    __subject: refSubject,
    __controlProps: controlProps
  }
}

export const componentRef = (): RvdRefObject<ComponentRef> => {
  return {
    current: null
  }
}

export const observableComponentRef = (): RvdRefObjectWithObservable<ComponentRef> => {
  const refSubject = subject()

  return {
    current: null,
    current$: refSubject,
    __subject: refSubject
  }
}
