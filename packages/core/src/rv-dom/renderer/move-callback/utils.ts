import {
  RvdChildrenManager,
  CreatedFragmentChild,
  Dictionary,
  KeyedChild
} from '../../../shared/types'
import { removeCreatedChild, removeCreatedFragment } from '../utils/children-manager'

type UpdateKeyedChild = (
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  createdChildren: RvdChildrenManager,
  isFragment?: boolean
) => void

export const updateKeyedChild: UpdateKeyedChild = (
  currentKeyedElement,
  oldKeyElementMap,
  createdFragment,
  childIndex,
  manager,
  isFragment = false
) => {
  const key: string | number = currentKeyedElement.child.key
  const children = isFragment ? manager.fragmentChildren : manager.children
  const hasOldElementInCreatedChildren =
    children[currentKeyedElement.index] &&
    !createdFragment.fragmentChildKeys[children[currentKeyedElement.index].key]

  if (hasOldElementInCreatedChildren) {
    if (isFragment) {
      removeCreatedFragment(manager, currentKeyedElement.index)
    } else {
      removeCreatedChild(manager, currentKeyedElement.index)
    }
  }

  createdFragment.fragmentChildKeys = {
    ...createdFragment.fragmentChildKeys,
    [key]: childIndex
  }
  delete oldKeyElementMap[key]
}
