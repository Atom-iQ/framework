import { teardownMiddleware, TeardownMiddlewareProp } from '../src'
import type { ComponentMiddleware, Middleware } from '@atom-iq/core'
import { Subscription, TeardownLogic } from 'rxjs'

describe('Teardown middleware', () => {
  // eslint-disable-next-line max-len
  test('should return middleware function, that`s adding teardown logic to parent element subscription', () => {
    const middleware = teardownMiddleware()
    const sub = new Subscription()
    const subSpy = jest.spyOn(sub, 'add')
    const teardown = (middleware.middlewares.component as Middleware<ComponentMiddleware>).fn(
      null,
      null,
      sub
    ) as TeardownMiddlewareProp
    const teardownLogic: TeardownLogic = jest.fn()
    teardown(teardownLogic)
    expect(subSpy).toBeCalledWith(teardownLogic)

    const teardownSub = new Subscription()
    teardown(teardownSub)

    expect(subSpy).toBeCalledWith(teardownSub)
    expect(subSpy).toBeCalledTimes(2)
  })
})
