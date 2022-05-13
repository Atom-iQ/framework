import {
  AtomiqContext,
  RvdContext,
  RvdContextHandle,
  RvdContextName
} from 'types';

import { hookContext, hookOverrideContext } from './manager'

export type RvdContextKey = RvdContextHandle | RvdContextName
export type RvdContextValue = Exclude<RvdContext[string], AtomiqContext>
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

export interface UseContextHook {
  (): <T extends RvdContextValue>(name: RvdContextKey) => T
  <T extends RvdContextValue>(name: RvdContextKey): T
}

export const useContext: UseContextHook = <T extends RvdContextValue = unknown>(
  name?: RvdContextKey
): T | (<A extends RvdContextValue>(name: RvdContextKey) => A) => {
  const context = hookContext()

  const useContextInternal = <A extends RvdContextValue = unknown>(name: RvdContextKey): A =>
    context[name] as A

  return name === undefined
    ? useContextInternal
    : useContextInternal<T>(name)
}

export interface UseProvideContextHook {
  <T extends RvdContextValue>(
    name: RvdContextKey,
    value: T,
    mapFromParent?: (parentValue: T, value: T) => T
  ): T
}

export const useProvideContext: UseProvideContextHook = <T extends RvdContextValue>(
  name: RvdContextKey,
  value: T,
  mapFromParent?: (parentValue: T, value: T) => T
): T => {
  return hookOverrideContext(
    name,
    mapFromParent ? mapFromParent(hookContext()[name] as T, value) : value
  )[name] as T
}
