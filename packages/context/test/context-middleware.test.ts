import { contextMiddleware } from '../src'
import { createContextMiddleware } from '../src/create-context-middleware'
import { useContextMiddleware } from '../src/use-context-middleware'

describe('Context Middleware (contextMiddleware function)', () => {
  test('should return Context middleware declaration', () => {
    const declaration = contextMiddleware()

    expect(declaration).toEqual({
      name: 'context',
      middlewares: {
        init: {
          // eslint-disable-next-line max-len
          fn: expect.any(Function) // initContextMiddleware returns anonymous function and it's reference is different in test
        },
        component: [
          {
            alias: 'createContext',
            fn: createContextMiddleware
          },
          {
            alias: 'context',
            fn: useContextMiddleware
          }
        ]
      }
    })
  })
})
