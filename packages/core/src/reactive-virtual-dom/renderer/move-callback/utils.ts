import { RvdChildrenManager, RvdCreatedFragment, RvdCreatedNode } from '../../../shared/types'
import { removeCreatedChild, removeCreatedFragment } from '../children-manager'

export function updateKeyedChild(
  currentKeyedElement: RvdCreatedNode | RvdCreatedFragment,
  parentFragment: RvdCreatedFragment,
  newChildIndex: string,
  manager: RvdChildrenManager,
  isFragment = false
): void {
  const key: string | number = currentKeyedElement.key
  const children = isFragment ? manager.fragmentChildren : manager.children
  const hasOldElementInCreatedChildren =
    children[currentKeyedElement.index] &&
    !parentFragment.keys[children[currentKeyedElement.index].key]

  if (hasOldElementInCreatedChildren) {
    if (isFragment) {
      removeCreatedFragment(manager, currentKeyedElement.index, parentFragment)
    } else {
      removeCreatedChild(manager, currentKeyedElement.index, parentFragment)
    }
  }

  parentFragment.keys[key] = newChildIndex
  delete parentFragment.oldKeys[key]
}
