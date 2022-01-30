import type { ComponentMiddleware, Middleware, RvdComponentNode } from '@atom-iq/core'
import { SubscriptionGroup, TeardownSubscription } from '@atom-iq/rx'

import { teardownMiddleware, TeardownMiddlewareProp } from '../src'

describe('Teardown middleware', () => {
  // eslint-disable-next-line max-len
  test('should return middleware function, that`s adding teardown logic to parent element subscription', () => {
    const middleware = teardownMiddleware()
    const sub = new SubscriptionGroup()
    const subSpy = jest.spyOn(sub, 'add')
    const teardown = (middleware.middlewares.component as Middleware<ComponentMiddleware>).fn(
      { sub } as RvdComponentNode,
      null
    ) as TeardownMiddlewareProp
    const teardownLogic: () => void = jest.fn()
    teardown(teardownLogic)
    expect(subSpy).toBeCalledWith(teardownLogic)

    const teardownSub = new TeardownSubscription()
    teardown(teardownSub)

    expect(subSpy).toBeCalledWith(teardownSub)
    expect(subSpy).toBeCalledTimes(2)
  })
})
