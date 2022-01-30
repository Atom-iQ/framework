import type { MiddlewareFactory } from '@atom-iq/core'
import type { Subscription } from '@atom-iq/rx'
import { TeardownSubscription } from '@atom-iq/rx'

export type TeardownMiddlewareProp = (teardown: Subscription | (() => void)) => void

export interface WithTeardown {
  teardown: TeardownMiddlewareProp
}

export const teardownMiddleware: MiddlewareFactory<[]> = () => ({
  name: 'teardown',
  middlewares: {
    component: {
      alias: 'teardown',
      fn:
        (rvdComponent): TeardownMiddlewareProp =>
        (teardown: Subscription | (() => void)) =>
          rvdComponent.sub.add(
            typeof teardown === 'function' ? new TeardownSubscription(teardown) : teardown
          )
    }
  }
})
