import { RvdComponentNode, RvdContext } from '@atom-iq/core'

import { useContextMiddleware } from '../src/use-context-middleware'

describe('Use Context Middleware', () => {
  test('should return function, getting field from current context for given field name', () => {
    const mockContext: RvdContext = {
      test: 'test',
      __iq__: null
    } as RvdContext

    const middleware = useContextMiddleware({} as RvdComponentNode, mockContext)
    expect(middleware('test')).toBe('test')
  })
})
