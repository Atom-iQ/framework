import { RvdContext, RvdElementNode, RvdStaticChild, RvdNodeFlags } from '@atom-iq/core'
import { initContextMiddleware } from '../src/init-context-middleware'

describe('Init Context Middleware', () => {
  test('should add new fields to root context, when initial context is provided', () => {
    const mockRootContext: RvdContext = {}
    const initialContext: RvdContext = {
      test: 'test-field'
    }

    const middleware = initContextMiddleware(initialContext)
    middleware({} as RvdStaticChild, document.createElement('div'), mockRootContext)

    expect(mockRootContext['test']).toEqual(initialContext.test)
  })

  // eslint-disable-next-line max-len
  test('should return root Reactive Virtual DOM Element and don`t change the context, when initial context is not provided', () => {
    const mockRootContext: RvdContext = {}
    const initialContext: RvdContext = {}

    const rootChild: RvdElementNode = {
      type: 'div',
      flag: RvdNodeFlags.HtmlElement
    }

    const middleware = initContextMiddleware(initialContext)
    const result = middleware(rootChild, document.createElement('div'), mockRootContext)

    expect(mockRootContext).toEqual({})
    expect(result).toBe(rootChild)
  })
})
