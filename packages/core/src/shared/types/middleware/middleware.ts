// v0.2.0

export interface MiddlewareFactory<TArgs> {
  (alias?: string, ...args: TArgs[]): MiddlewarePackageDefinition
}

export interface MiddlewarePackageDefinition {
  /** should be the same as a package name **/
  name: string
  /** for custom ordering of renderer middlewares or as a name
   * of middleware prop of component middlewares **/
  alias?: string
  /** names of middleware packages needed for this package to work **/
  dependencies?: string[]
  /** All package middlewares, grouped by type **/
  middlewares: MiddlewaresMap
}

export interface MiddlewaresMap {
  renderer?: RendererMiddlewaresMap
  component?: Middleware | Middleware[]
}

export interface RendererMiddlewaresMap {
  /** Before DOM element render - get RvdDOMElement, return new or modified RvdDOMElement **/
  elementPreRender?: Middleware | Middleware[]
  /** After DOM element create, but before appending it to parent - get
   * RvdDOMElement and real DOM Element, and return DOM Element **/
  elementPostRender?: Middleware | Middleware[]
  /** Before calling Component function - get RvdComponentElement,
   * return new or modified RvdComponentElement **/
  componentPreRender?: Middleware | Middleware[]
  /** After calling component function, before rendering rvDOM returned from Component **/
  componentRender?: Middleware | Middleware[]
  /** After creating DOM Elements for rvDOM returned from Component **/
  componentPostRender?: Middleware | Middleware[]
}

export interface Middleware<TMiddlewareFunction extends Function = Function> {
  /** need to be set, if there are multiple middlewares of the same subtype, otherwise it's set
   * automatically as `{middlewareSubtypeName}`, it's used then to quickly allocate package's
   * middlewares with `{packageName}__{name}` or `{packageAlias}__{name}`**/
  name?: string
  /** names of middlewares that have to run before given middleware **/
  mustRunAfter?: 'all' | string | string[]
  /** names of middlewares that need to run after given middleware **/
  mustRunBefore?: 'all' | string | string[]
  fn: TMiddlewareFunction
}
