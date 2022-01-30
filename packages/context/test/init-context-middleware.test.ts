import { RvdContext, RvdElementNode, RvdStaticChild, RvdNodeFlags } from '@atom-iq/core'

import { initContextMiddleware } from '../src/init-context-middleware'

describe('Init Context Middleware', () => {
  test('should add new fields to root context, when initial context is provided', () => {
    const mockRootContext = {} as RvdContext
    const initialContext: RvdContext = {
      test: 'test-field',
      __iq__: null
    } as RvdContext

    const middleware = initContextMiddleware(initialContext)
    middleware(mockRootContext, {} as RvdStaticChild)

    expect(mockRootContext['test']).toEqual(initialContext.test)
  })

  // eslint-disable-next-line max-len
  test('should return root Reactive Virtual DOM Element and don`t change the context, when initial context is not provided', () => {
    const mockRootContext = {} as RvdContext
    const initialContext = {} as RvdContext

    const rootChild: RvdElementNode = {
      type: 'div',
      flag: RvdNodeFlags.HtmlElement
    }

    const middleware = initContextMiddleware(initialContext)
    const result = middleware(mockRootContext, rootChild)

    expect(mockRootContext).toEqual({})
    expect(result).toBe(rootChild)
  })
})
