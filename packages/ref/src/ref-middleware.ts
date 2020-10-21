import { MiddlewareFactory } from '@atom-iq/core'
import { componentRefMiddleware } from './component-ref-middleware'
import { elementRefMiddleware } from './element-ref-middleware'

export const refMiddleware: MiddlewareFactory<[]> = () => {
  return {
    name: 'ref',
    middlewares: {
      component: {
        alias: 'attachRef',
        fn: componentRefMiddleware
      },
      renderer: {
        elementPreConnect: {
          fn: elementRefMiddleware
        }
      }
    }
  }
}
