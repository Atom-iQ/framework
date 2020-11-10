import type { CreatedFragmentChild, RvdChildrenManager } from '../../../shared/types'
import { removeChild, renderTypeSwitch, unsubscribe } from '../utils'
import { removeExistingFragment } from '../dom-renderer'
import { removeCreatedChild } from '../children-manager'

/**
 * Called when parent element child is streaming null value (static null child is no-op)
 *
 * Returned render callback is called after change in rvDOM - value of child RvdNode
 * stream is changed to null (new null value was emitted by the source).
 * It makes corresponding changes in DOM - removing element child, or array/fragment children
 * rendered on given position, from DOM and from RVD Children Manager abstraction layer
 * @param childIndex
 * @param parentElement
 * @param manager
 * @param parentFragment
 */
export function nullRenderCallback(
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  parentFragment?: CreatedFragmentChild
): void {
  if (manager.isInAppendMode || (parentFragment && parentFragment.isInFragmentAppendMode)) {
    return
  }

  renderTypeSwitch(
    childIndex,
    manager,
    existingChild => {
      removeChild(parentElement, existingChild.element)
      unsubscribe(existingChild)
      removeCreatedChild(manager, existingChild.index, parentFragment)
    },
    removeExistingFragment(null, childIndex, parentElement, manager, parentFragment)
  )
}
