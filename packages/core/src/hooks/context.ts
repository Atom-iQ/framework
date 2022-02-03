import { AtomiqContext, AtomiqContextKey, RvdContext } from 'types'

import { hookContext, hookOverrideContext } from './manager'

export type RvdContextKey = Exclude<keyof RvdContext, AtomiqContextKey>
export type RvdContextValue = Exclude<RvdContext[string], AtomiqContext>

export interface UseContextHook {
  (): <T extends RvdContextValue>(name: RvdContextKey) => T
  <T extends RvdContextValue>(name: RvdContextKey): T
}

export const useContext: UseContextHook = <T extends RvdContextValue = unknown>(
  name?: RvdContextKey
): T | (<A extends RvdContextValue>(name: RvdContextKey) => A) => {
  const context = hookContext()

  const useContextInternal = <A extends RvdContextValue = unknown>(name: RvdContextKey) =>
    context[name]

  return name === undefined
    ? (useContextInternal as <A extends RvdContextValue>(name: RvdContextKey) => A)
    : (useContextInternal<T>(name) as T)
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
