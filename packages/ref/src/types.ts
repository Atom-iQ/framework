import type { ComponentRef } from '@atom-iq/core'

export interface ShareRefMiddleware {
  (ref: ComponentRef): void
  (callback: (ref: ComponentRef) => ComponentRef): void
  (refOrCallback: ComponentRef | ((ref: ComponentRef) => ComponentRef)): void
}

export interface ShareRef {
  shareRef: ShareRefMiddleware
}
