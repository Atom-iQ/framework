import type { RvdFragmentNode, RvdNode } from 'types'
import { removeExistingGroup, unsubscribe } from '../utils'
import { RvdNodeFlags } from 'shared/flags'

/**
 * Called when parent element child is streaming null value (static null child is no-op)
 *
 * Returned render callback is called after change in rvDOM - value of child RvdNode
 * stream is changed to null (new null value was emitted by the source).
 * It makes corresponding changes in DOM - removing element child, or array/fragment children
 * rendered on given position, from DOM and from RVD Children Manager abstraction layer
 * @param childIndex
 * @param parentRvdNode
 */
export function nullRenderCallback(childIndex: number, parentRvdNode: RvdNode): void {
  if (parentRvdNode.rvd[childIndex]) {
    const existingChild = parentRvdNode.rvd[childIndex]
    if (RvdNodeFlags.ElementOrText & existingChild.flag) {
      parentRvdNode.dom.removeChild(existingChild.dom)
      unsubscribe(existingChild)
    } else {
      removeExistingGroup(existingChild as RvdFragmentNode, parentRvdNode)
      unsubscribe(existingChild)
    }
  }
  parentRvdNode.rvd[childIndex] = undefined
}
