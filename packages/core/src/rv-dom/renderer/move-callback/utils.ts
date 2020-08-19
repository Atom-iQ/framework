import { getFlattenFragmentChildren, unsubscribe } from '../utils'
import { removeChildFromIndexPosition } from '../dom-renderer'
import { CreatedChildrenManager, CreatedFragmentChild, Dictionary, KeyedChild } from '@@types'

export const removeExistingFragment = (
  oldKeyElementMap: Dictionary<KeyedChild>,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
) => (existingFragment: CreatedFragmentChild): void => {
  existingFragment.fragmentChildIndexes
    .reduce(getFlattenFragmentChildren(createdChildren, true), [])
    .forEach((fragmentChildIndex: string) => {
      removeChildFromIndexPosition(
        removedChild => {
          if (!existingFragment.key || !oldKeyElementMap[existingFragment.key]) {
            unsubscribe(removedChild)
          }

          createdChildren.remove(fragmentChildIndex)
        },
        fragmentChildIndex,
        element,
        createdChildren
      )
    })

  if (!existingFragment.key || !oldKeyElementMap[existingFragment.key]) {
    unsubscribe(existingFragment)
  }
  createdChildren.removeFragment(childIndex)
}
