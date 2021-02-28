import { CombinedMiddlewares, RvdComponentNode, RvdContext, RvdStaticChild } from 'types'
import { arrayReduce, isFunction } from 'shared'
import { Subscription } from 'rxjs'

let middlewares: CombinedMiddlewares = null
let hasMiddlewares = false

export const initMiddlewares = (
  combinedMiddlewares: CombinedMiddlewares,
  rootRvdElement: RvdStaticChild,
  rootDOMElement: Element,
  context: RvdContext
): RvdStaticChild => {
  if (!middlewares && combinedMiddlewares) {
    middlewares = combinedMiddlewares
    hasMiddlewares = true
    return applyMiddlewares('init', rootRvdElement, rootDOMElement, context)
  }
  return rootRvdElement
}

interface ComponentMiddlewaresFnReturn {
  props?: { [alias: string]: Function }
  context: RvdContext
}

export const applyComponentMiddlewares = (
  rvdComponentElement: RvdComponentNode,
  context: RvdContext,
  parentSubscription: Subscription
): ComponentMiddlewaresFnReturn => {
  let middlewareProps: { [alias: string]: Function }
  if (hasMiddlewares && middlewares.component && rvdComponentElement.type.useMiddlewares) {
    middlewareProps = arrayReduce(
      rvdComponentElement.type.useMiddlewares,
      (props, alias) => {
        const middleware = middlewares.component[alias](
          rvdComponentElement,
          context,
          parentSubscription
        )
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: [TChild, ...any[]]
): TChild => {
  if (hasMiddlewares && middlewares[type]) {
    const toApply = middlewares[type]
    const rvdElement: RvdStaticChild = args.shift()
    return toApply.order.reduce((rvdElement, middleware) => {
      return (toApply.middlewares[middleware] as Function)(rvdElement, ...args)
    }, rvdElement)
  }

  return args[0]
}
