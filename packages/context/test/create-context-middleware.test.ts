import { ComponentMiddlewareTuple, RvdComponentElement, RvdContext } from '@atom-iq/core'
import { createContextMiddleware } from '../src/create-context-middleware'

describe('Create Context Middleware', () => {
  // eslint-disable-next-line max-len
  test('should create new nested context - clone parent context fields, and return new context and function, that`s adding new fields to new context', () => {
    const mockParentContext: RvdContext = {
      test: 'test',
      mock: 'mock'
    }

    const [middlewareFn, newContext] = createContextMiddleware(
      {} as RvdComponentElement,
      mockParentContext
    ) as ComponentMiddlewareTuple

    expect(newContext).toEqual(mockParentContext)
    expect(newContext).not.toBe(mockParentContext)

    middlewareFn('newTest', 'new test value')
    expect(newContext['newTest']).toBe('new test value')
    expect(mockParentContext['newTest']).toBeUndefined()

    middlewareFn('test', 'changed test')
    expect(newContext['test']).toBe('changed test')
    expect(mockParentContext['test']).toBe('test')
    expect(newContext).not.toEqual(mockParentContext)
  })
})
