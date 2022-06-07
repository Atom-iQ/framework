import { withRest } from '@atom-iq/fx'

import type {
  RvdContextFieldUnion,
  RvdContext,
  RvdContextHandle,
  RvdContextName
} from 'types'

import { hookContext, hookOverrideContext } from './manager'

export type RvdContextKey = RvdContextHandle | RvdContextName
//
// export interface ContextProviderProps<T extends RvdContextValue> {
//   value: T
//   children: RvdChild
// }
// export type ContextProvider<T extends RvdContextValue> = RvdComponent<ContextProviderProps<T>>
//
// type CreateContextResult<T extends RvdContextValue, H extends RvdContextKey> = readonly [ContextProvider<T>, H]
//
// export interface CreateContext {
//   <T extends RvdContextValue>(): CreateContextResult<T, RvdContextHandle>
//   <T extends RvdContextValue>(name: RvdContextName): CreateContextResult<T, RvdContextName>
// }
//
// let contextHandle = 0
//
// export const createContext = <T extends RvdContextValue>(name?: RvdContextName | never): CreateContextResult<T, RvdContextKey> => {
//   const handle = name || ++contextHandle
//   const Provider = ({ value, children }: ContextProviderProps<T>): RvdChild => {
//     useProvideContext(handle, value)
//     return children
//   }
//   return [Provider, handle] as const
// }

/**
 * Use Context hook interface
 */
export interface UseContext {
  <T extends RvdContextFieldUnion>(name: RvdContextKey): T
}

/**
 * Use Context hook
 *
 * Get context value for given context key
 * @param name
 */
export const useContext: UseContext = <T extends RvdContextFieldUnion>(
  name: RvdContextKey
): T => getContextValue(name, hookContext())

/**
 * Use Context Factory hook interface
 */
export interface UseContextFactory {
  (): UseContext
}

/**
 * Use Context Factory hook
 *
 * Get function that gets context value for given context key.
 * Has correct context object saved in closure.
 * Result function could be used in async operations in component
 */
export const useContextFactory: UseContextFactory = () =>
  withRest(getContextValue, hookContext()) as UseContext

const getContextValue = <T extends RvdContextFieldUnion>(name: RvdContextKey, context: RvdContext): T =>
  context[name] as T

/**
 * Use Provide Context hook interface
 */
export interface UseProvideContext {
  <T extends RvdContextFieldUnion>(
    name: RvdContextKey,
    value: T
  ): T
  <T extends RvdContextFieldUnion>(
    name: RvdContextKey,
    value: T,
    mapFromParent: (parentValue: T, newValue: T) => T
  ): T
}

/**
 * Use Provide Context
 *
 * Set/override context value for given context key.
 * Optionally could map context value from parent context.
 * Returns new context value
 * @param name
 * @param value
 * @param mapFromParent
 */
export const useProvideContext: UseProvideContext = <T extends RvdContextFieldUnion>(
  name: RvdContextKey,
  value: T,
  mapFromParent?: (parentValue: T, newValue: T) => T
): T => {
  return hookOverrideContext(
    name,
    mapFromParent ? mapFromParent(hookContext()[name] as T, value) : value
  )[name] as T
}
