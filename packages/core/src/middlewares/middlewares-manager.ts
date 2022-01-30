import { CombinedMiddlewares, RvdComponentNode, RvdContext, RvdStaticChild } from 'types'
import { isFunction } from 'shared'

interface ComponentMiddlewaresFnReturn {
  props?: { [alias: string]: Function }
  context: RvdContext
}

export const applyComponentMiddlewares = (
  context: RvdContext,
  rvdComponentElement: RvdComponentNode
): ComponentMiddlewaresFnReturn => {
  let middlewareProps: { [alias: string]: Function }
  const middlewares = context.$.middlewares
  if (middlewares && middlewares.component && rvdComponentElement.type.useMiddlewares) {
    middlewareProps = rvdComponentElement.type.useMiddlewares.reduce((props, alias) => {
      const middleware = middlewares.component[alias](rvdComponentElement, context)
      if (isFunction(middleware)) {
        props[alias] = middleware
      } else {
        props[alias] = middleware[0]
        context = middleware[1]
      }

      return props
    }, {})
  }
  return {
    props: middlewareProps,
    context
  }
}

export const applyMiddlewares = <TChild extends RvdStaticChild>(
  type: keyof Omit<CombinedMiddlewares, 'component'>,
  context: RvdContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: [TChild, ...any[]]
): TChild => {
  const middlewares = context.$.middlewares
  if (middlewares && middlewares[type]) {
    return middlewares[type].order.reduce((rvdElement, middleware) => {
      return (middlewares[type].middlewares[middleware] as Function)(context, ...args)
    }, args[0])
  }

  return args[0]
}
