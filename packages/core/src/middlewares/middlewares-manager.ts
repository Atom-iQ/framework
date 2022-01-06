import { CombinedMiddlewares, RvdComponentNode, RvdContext, RvdStaticChild } from 'types'
import { arrayReduce, atomiqContext, isFunction } from 'shared'

interface ComponentMiddlewaresFnReturn {
  props?: { [alias: string]: Function }
  context: RvdContext
}

export const applyComponentMiddlewares = (
  context: RvdContext,
  rvdComponentElement: RvdComponentNode
): ComponentMiddlewaresFnReturn => {
  let middlewareProps: { [alias: string]: Function }
  const middlewares = atomiqContext(context).middlewares
  if (middlewares && middlewares.component && rvdComponentElement.type.useMiddlewares) {
    middlewareProps = arrayReduce(
      rvdComponentElement.type.useMiddlewares,
      (props, alias) => {
        const middleware = middlewares.component[alias](rvdComponentElement, context)
        if (isFunction(middleware)) {
          props[alias] = middleware
        } else {
          props[alias] = middleware[0]
          context = middleware[1]
        }

        return props
      },
      {}
    )
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
  const middlewares = atomiqContext(context).middlewares
  if (middlewares && middlewares[type]) {
    return arrayReduce(
      middlewares[type].order,
      (rvdElement, middleware) => {
        return (middlewares[type].middlewares[middleware] as Function)(context, ...args)
      },
      args[0]
    )
  }

  return args[0]
}
