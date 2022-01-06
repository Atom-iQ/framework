import type { MiddlewareFactory } from '@atom-iq/core'
import type { TeardownLogic } from 'rxjs'

export type TeardownMiddlewareProp = (teardown: TeardownLogic) => void

export interface WithTeardown {
  teardown: TeardownMiddlewareProp
}

export const teardownMiddleware: MiddlewareFactory<[]> = () => ({
  name: 'teardown',
  middlewares: {
    component: {
      alias: 'teardown',
      fn:
        (_component, _context, sub): TeardownMiddlewareProp =>
        (teardown: TeardownLogic) =>
          sub.add(teardown)
    }
  }
})
