import { RvdComponentElement, RvdContext } from '@atom-iq/core'
import { useContextMiddleware } from '../src/use-context-middleware'

describe('Use Context Middleware', () => {
  test('should return function, getting field from current context for given field name', () => {
    const mockContext: RvdContext = {
      test: 'test'
    }

    const middleware = useContextMiddleware({} as RvdComponentElement, mockContext)
    expect(middleware('test')).toBe('test')
  })
})
