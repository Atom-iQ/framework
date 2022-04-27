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

export const updateHooksManager = (component: RvdComponentNode, context: RvdContext) => {
  hooksManager.node = component
  hooksManager.context = context
  hooksManager.onInit = null
}

export const hookComponentNode = () => hooksManager.node
export const hookContext = () => hooksManager.context
export const hookOnInit = () => hooksManager.onInit

export const hookOverrideContext = (
  name: Exclude<keyof RvdContext, AtomiqContextKey>,
  newValue: Exclude<RvdContext[string], AtomiqContext>
): RvdContext => {
  const contextCopy: Partial<RvdContext> = Object.assign({}, hooksManager.context)
  contextCopy[name] = newValue
  return (hooksManager.context = contextCopy as RvdContext)
}

export const hookOverrideOnInit = (fn: () => void) => (hooksManager.onInit = fn)
