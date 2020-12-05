import { MiddlewareFactory, RvdComponentElement, RvdContext } from '@atom-iq/core'
import { routerConfig } from './from-routing'

function routeMiddleware(rvdComponentElement: RvdComponentElement, oldContext: RvdContext) {
  const newContext = Object.assign({}, oldContext)

  const routeMiddlewareFn = (routePath?: string) => {
    if (routePath) {
      newContext['route']['basePath'] =
        newContext['route']['basePath'] + (routePath.startsWith('/') ? routePath : '/' + routePath)
    }

    return newContext['route']['basePath']
  }

  return [routeMiddlewareFn, newContext]
}

export const routerMiddleware: MiddlewareFactory<[boolean?]> = (useHistory = true) => {
  routerConfig.useHistory = useHistory

  return {
    name: 'router',
    middlewares: {
      component: {
        alias: 'route',
        fn: routeMiddleware
      }
    }
  }
}
