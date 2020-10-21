import type { MiddlewareFactory, RvdContext } from '@atom-iq/core'
import { createContextMiddleware } from './create-context-middleware'
import { useContextMiddleware } from './use-context-middleware'
import { initContextMiddleware } from './init-context-middleware'

/**
 * Atom-iQ Context Middleware
 *
 * Providing access to the context in Atom-iQ app
 * @param initialContext
 */
export const contextMiddleware: MiddlewareFactory<[RvdContext] | []> = (
  initialContext?: RvdContext
) => {
  return {
    name: 'context',
    middlewares: {
      init: {
        fn: initContextMiddleware(initialContext)
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
  }
}
