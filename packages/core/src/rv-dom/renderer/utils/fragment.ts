import type {
  CreatedChild,
  CreatedChildrenManager,
  CreatedNodeChild,
  RvdChild,
  RvdFragmentElement
} from '../../../shared/types'
import { _FRAGMENT } from '../../../shared'
import { RvdChildFlags, RvdElementFlags } from '../../../shared/flags'
import { CreatedFragmentChild, Dictionary, KeyedChild } from '../../../shared/types'
import { removeChildFromIndexPosition } from '../dom-renderer'
import { unsubscribe } from './observable'

export const childrenArrayToFragment = (children: RvdChild[]): RvdFragmentElement => ({
  type: _FRAGMENT,
  elementFlag: RvdElementFlags.Fragment,
  children,
  childFlags:
    children.length === 1
      ? RvdChildFlags.HasSingleUnknownChild
      : RvdChildFlags.HasMultipleUnknownChildren
})

export const getFlattenFragmentChildren = (
  createdChildren: CreatedChildrenManager,
  onlyIndexes = false
) => (all: (CreatedChild | string)[], index: string): (CreatedChild | string)[] => {
  const child = createdChildren.get(index) || createdChildren.getFragment(index)
  return child.fragmentChildIndexes
    ? all.concat(
        child.fragmentChildIndexes.reduce(
          getFlattenFragmentChildren(createdChildren, onlyIndexes),
          []
        )
      )
    : all.concat(onlyIndexes ? child.index : child)
}

export const removeExistingFragment = (
  oldKeyElementMap: Dictionary<KeyedChild> | null,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
) => (existingFragment: CreatedFragmentChild): void => {
  const isSavedWithKey =
    oldKeyElementMap && existingFragment.key && oldKeyElementMap[existingFragment.key]

  existingFragment.fragmentChildIndexes
    .reduce(getFlattenFragmentChildren(createdChildren), [])
    .forEach((existingChild: CreatedNodeChild) => {
      removeChildFromIndexPosition(
        () => {
          if (!isSavedWithKey) {
            unsubscribe(existingChild)
          }

          createdChildren.remove(existingChild.index)
        },
        existingChild.index,
        element,
        existingChild.element
      )
    })

  if (!isSavedWithKey) {
    unsubscribe(existingFragment)
  }
  createdChildren.removeFragment(childIndex)
}
