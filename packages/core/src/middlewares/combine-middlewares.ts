import type {
  CombinedMiddlewares,
  CombinedMiddlewaresOrder,
  CombineMiddlewaresFn,
  Middleware,
  MiddlewarePackageDefinition,
  Dictionary,
  ComponentMiddleware,
  InitMiddleware,
  ElementPreRenderMiddleware,
  ElementPreConnectMiddleware,
  TextPreRenderMiddleware
} from 'types'
import { arrayReduce, isArray } from 'shared'

type PackagesMap = Dictionary<MiddlewarePackageDefinition>

type AddMiddlewareFn = (middleware: Middleware) => void
type AddMiddlewareFactory = (
  pkgName: string
) => (middlewareType: keyof CombinedMiddlewares) => AddMiddlewareFn

type MiddlewareUnion =
  | InitMiddleware
  | ElementPreRenderMiddleware
  | ElementPreConnectMiddleware
  | TextPreRenderMiddleware

export const combineMiddlewares: CombineMiddlewaresFn =
  (...middlewares: MiddlewarePackageDefinition[]) =>
  (middlewaresOrder?: CombinedMiddlewaresOrder) => {
    // Init combined middlewares object
    const combinedMiddlewares: CombinedMiddlewares = {}

    // Reduce middleware packages from args array to quick access object
    const pkgsMap: PackagesMap = arrayReduce(
      middlewares,
      (packages, current) => {
        packages[current.name] = current
        return packages
      },
      {}
    )

    // Create Add Middleware Factory Function
    const addMiddlewareFromPackage: AddMiddlewareFactory =
      (pkgName: string) =>
      (middlewareType: keyof CombinedMiddlewares) =>
      (middleware: Middleware) => {
        const name = middleware.name || pkgName
        if (middlewareType === 'component') {
          if (!combinedMiddlewares.component) {
            combinedMiddlewares.component = {}
          }
          combinedMiddlewares.component[middleware.alias || name] =
            middleware.fn as ComponentMiddleware
        } else {
          if (!combinedMiddlewares[middlewareType]) {
            combinedMiddlewares[middlewareType] = {
              middlewares: {},
              order: []
            }
          }

          combinedMiddlewares[middlewareType].middlewares[name] = middleware.fn as MiddlewareUnion
          combinedMiddlewares[middlewareType].order =
            combinedMiddlewares[middlewareType].order.concat(name)
        }
      }

    /**
     * Add middlewares from array or single middleware
     * @param middleware
     * @param addFn
     */
    const addMiddlewares = (middleware: Middleware | Middleware[], addFn: AddMiddlewareFn) => {
      if (isArray(middleware)) {
        for (let i = 0; i < middleware.length; i++) {
          addFn(middleware[i])
        }
      } else {
        addFn(middleware)
      }
    }

    /**
     * Get middlewares from package and add them to combined middlewares
     * Check if all dependencies are met
     * @param pkg
     */
    const addPackageMiddlewares = (pkg: MiddlewarePackageDefinition) => {
      if (pkg.dependencies) {
        const deps = pkg.dependencies
        if (deps.some(dependency => !pkgsMap[dependency])) {
          throw Error(
            `Cannot find required dependencies for ${pkg.name}:
          ${deps.filter(d => !pkgsMap[d]).join(', ')}`
          )
        }
      }

      const addMiddlewareForType = addMiddlewareFromPackage(pkg.name)
      // Add init middlewares
      if (pkg.middlewares.init) {
        addMiddlewares(pkg.middlewares.init, addMiddlewareForType('init'))
      }
      // Add component middlewares
      if (pkg.middlewares.component) {
        addMiddlewares(pkg.middlewares.component, addMiddlewareForType('component'))
      }
      // Add renderer middlewares
      if (pkg.middlewares.renderer) {
        for (const middlewareType in pkg.middlewares.renderer) {
          if (pkg.middlewares.renderer[middlewareType]) {
            addMiddlewares(
              pkg.middlewares.renderer[middlewareType],
              addMiddlewareForType(middlewareType as keyof CombinedMiddlewares)
            )
          }
        }
      }
    }

    for (let i = 0; i < middlewares.length; i++) addPackageMiddlewares(middlewares[i])

    if (middlewaresOrder) {
      for (const middlewareType in combinedMiddlewares) {
        if (middlewareType !== 'component' && middlewaresOrder[middlewareType]) {
          combinedMiddlewares[middlewareType] = {
            middlewares: combinedMiddlewares[middlewareType].middlewares,
            order: middlewaresOrder[middlewareType]
          }
        }
      }
    }

    return combinedMiddlewares
  }
