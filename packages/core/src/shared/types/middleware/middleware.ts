// v0.2.0

import type { RvdComponentNode, RvdContext, RvdElementNode, RvdNode, RvdStaticChild } from '..'
import type { Subscription } from 'rxjs'

export type CombineMiddlewaresFn = (
  ...middlewares: MiddlewarePackageDefinition[]
) => (middlewaresOrder?: CombinedMiddlewaresOrder) => CombinedMiddlewares

export interface CombinedMiddlewares {
  init?: Middlewares<InitMiddleware>
  component?: ComponentMiddlewares
  elementPreRender?: Middlewares<ElementPreRenderMiddleware>
  elementPreConnect?: Middlewares<ElementPreConnectMiddleware>
  textPreRender?: Middlewares<TextPreRenderMiddleware>
}

export interface CombinedMiddlewaresOrder {
  elementPreRender?: string[]
  elementPreConnect?: string[]
  elementPostConnect?: string[]
  textPreRender?: string[]
  componentPreRender?: string[]
  componentChildRender?: string[]
}

export interface ComponentMiddlewares {
  [alias: string]: ComponentMiddleware
}

export interface Middlewares<TMiddlewareFunction extends Function = Function> {
  order: string[]
  middlewares: {
    [name: string]: TMiddlewareFunction
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MiddlewareFactory<TArgs extends Array<any>> {
  (...args: TArgs): MiddlewarePackageDefinition
}

export interface MiddlewarePackageDefinition {
  /** should be the same as a package name or last part of package name for atom-iq scoped packages **/
  name: string
  /** names of middleware packages needed for this package to work **/
  dependencies?: string[]
  /** All package middlewares, grouped by type **/
  middlewares: MiddlewaresMap
}

export interface MiddlewaresMap {
  renderer?: RendererMiddlewaresMap
  component?: Middleware<ComponentMiddleware> | Middleware<ComponentMiddleware>[]
  init?: Middleware<InitMiddleware>
}

export interface InitMiddleware {
  (context: RvdContext, rootRvdElement: RvdStaticChild, rootDOMElement: Element): RvdStaticChild
}

export interface ComponentMiddleware {
  (rvdComponentElement: RvdComponentNode, context?: RvdContext, parentSubscription?: Subscription):
    | ComponentMiddlewareFn
    | ComponentMiddlewareTuple
}

export interface ComponentMiddlewareFn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any[]): any
}

export type ComponentMiddlewareTuple = [ComponentMiddlewareFn, RvdContext]

export interface ElementPreRenderMiddleware {
  (context: RvdContext, rvdElement: RvdElementNode, parentRvdNode: RvdNode): RvdElementNode
}

export interface ElementPreConnectMiddleware {
  (context: RvdContext, rvdElement: RvdElementNode): RvdElementNode
}

export interface TextPreRenderMiddleware {
  (
    context: RvdContext,
    textChild: string | number,
    textChildIndex: number,
    parentRvdNode: RvdNode
  ): string | number
}

export interface RendererMiddlewaresMap {
  /** Before DOM element create **/
  elementPreRender?:
    | Middleware<ElementPreRenderMiddleware>
    | Middleware<ElementPreRenderMiddleware>[]
  /** After DOM element create, before connecting props and rendering children  **/
  elementPreConnect?:
    | Middleware<ElementPreConnectMiddleware>
    | Middleware<ElementPreConnectMiddleware>[]
  /** Before creating/updating TextNode **/
  textPreRender?: Middleware<TextPreRenderMiddleware> | Middleware<TextPreRenderMiddleware>[]
}

export interface Middleware<TMiddlewareFunction extends Function = Function> {
  /** Only when package has multiple middlewares of the same type, otherwise package name is used **/
  name?: string
  /**  name of middleware prop of component middlewares **/
  alias?: string
  /** names of middlewares that have to run before given middleware **/
  fn: TMiddlewareFunction
}
