let nextHandle = 1
let resolved: Promise<void>
const activeHandles: { [key: number]: boolean } = {}

/**
 * Finds the handle in the list of active handles, and removes it.
 * Returns `true` if found, `false` otherwise. Used both to clear
 * Immediate scheduled tasks, and to identify if a task should be scheduled.
 */
function findAndClearHandle(handle: number): boolean {
  if (handle in activeHandles) {
    delete activeHandles[handle]
    return true
  }
  return false
}

export function setImmediate(cb: () => void): number {
  const handle = nextHandle++
  activeHandles[handle] = true
  if (!resolved) {
    resolved = Promise.resolve()
  }
  resolved.then(() => findAndClearHandle(handle) && cb())
  return handle
}

export function clearImmediate(handle: number): void {
  findAndClearHandle(handle)
}
