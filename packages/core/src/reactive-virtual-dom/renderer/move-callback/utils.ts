import {
  RvdChildrenManager,
  CreatedFragmentChild,
  Dictionary,
  KeyedChild
} from '../../../shared/types'
import { removeCreatedChild, removeCreatedFragment } from '../children-manager'

export function updateKeyedChild(
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  manager: RvdChildrenManager,
  isFragment = false
): void {
  const key: string | number = currentKeyedElement.child.key
  const children = isFragment ? manager.fragmentChildren : manager.children
  const hasOldElementInCreatedChildren =
    children[currentKeyedElement.index] &&
    !createdFragment.fragmentChildKeys[children[currentKeyedElement.index].key]

  if (hasOldElementInCreatedChildren) {
    if (isFragment) {
      removeCreatedFragment(manager, currentKeyedElement.index, createdFragment)
    } else {
      removeCreatedChild(manager, currentKeyedElement.index, createdFragment)
    }
  }

  createdFragment.fragmentChildKeys = {
    ...createdFragment.fragmentChildKeys,
    [key]: childIndex
  }
  delete oldKeyElementMap[key]
}
