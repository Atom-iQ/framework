import type { Observable } from 'rxjs'
import type { ComponentRef, ComponentRefProp, ElementRef, ElementRefProp } from '@atom-iq/core'

export type ElementRefTuple = [Observable<ElementRef>, () => ElementRefProp]

export type ComponentRefTuple = [Observable<ComponentRef>, () => ComponentRefProp]

export interface AttachRefMiddlewareProp {
  (callback: (ref: ComponentRef) => ComponentRef): void
}

export interface WithAttachRef {
  attachRef: AttachRefMiddlewareProp
}
