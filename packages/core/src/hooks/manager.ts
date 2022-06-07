import type { AtomiqContext, AtomiqContextKey, RvdComponentNode, RvdContext } from 'types'

export interface RvdHooksManager {
  node: RvdComponentNode
  context: RvdContext
  onInit: (() => void) | null
}

const hooksManager = {
  node: null,
  context: null,
  onInit: null
} as RvdHooksManager

/**
 * Update Hooks Manager
 *
 * Set currently processed component and current context in hooksManager.
 * Called before calling component function.
 *
 * Shouldn't be used anywhere, except component middleware
 * @param component
 * @param context
 */
export const updateHooksManager = (component: RvdComponentNode, context: RvdContext) => {
  hooksManager.node = component
  hooksManager.context = context
  hooksManager.onInit = null
}

/**
 * Hook Component Node
 *
 * Get currently processed component node instance.
 * Used for creating hooks.
 */
export const hookComponentNode = () => hooksManager.node

/**
 * Hook Context
 *
 * Get current context object
 * Used for creating hooks.
 */
export const hookContext = () => hooksManager.context

/**
 * Hook On Init
 *
 * Get currently save onInit callback.
 * Used in component renderer
 */
export const hookOnInit = () => hooksManager.onInit

/**
 * Hook Override Context
 *
 * Set/override current context object.
 * Used for creating hooks.
 * @param name
 * @param newValue
 */
export const hookOverrideContext = (
  name: Exclude<keyof RvdContext, AtomiqContextKey>,
  newValue: Exclude<RvdContext[string], AtomiqContext>
): RvdContext => {
  const contextCopy: Partial<RvdContext> = Object.assign({}, hooksManager.context)
  contextCopy[name] = newValue
  return (hooksManager.context = contextCopy as RvdContext)
}

/**
 * Hook Override On Init
 *
 * Set/override current onInit callback.
 * Used for creating hooks.
 * @param fn
 */
export const hookOverrideOnInit = (fn: () => void) => (hooksManager.onInit = fn)
