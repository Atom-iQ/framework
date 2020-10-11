import type {
  CreatedChildrenManager,
  CreatedFragmentChild,
  Dictionary,
  KeyedChild
} from '../../../shared/types'
import { removeChildFromIndexPosition, renderChildInIndexPosition } from '../dom-renderer'
import { renderTypeSwitch, unsubscribe } from '../utils'
import { removeExistingFragment } from './utils'

const moveFragment = (
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
) => () => {
  const key: string | number = currentKeyedElement.child.key
  const childIndexPartsLength = childIndex.split('.').length

  currentKeyedElement.fragmentChildren.forEach(fragmentChild => {
    const fragmentChildIndexRest = fragmentChild.index
      .split('.')
      .slice(childIndexPartsLength)
      .join('.')

    renderChildInIndexPosition(
      newChild => {
        createdChildren.add(newChild.index, {
          ...newChild,
          key: fragmentChild.key,
          subscription: fragmentChild.subscription
        })

        if (createdChildren.has(fragmentChild.index)) {
          createdChildren.remove(fragmentChild.index)
        }
      },
      fragmentChild.element,
      `${childIndex}.${fragmentChildIndexRest}`,
      element,
      createdChildren
    )
  })

  const hasOldFragmentInCreatedChildren =
    createdChildren.getFragment(currentKeyedElement.index) &&
    !createdFragment.fragmentChildKeys[createdChildren.getFragment(currentKeyedElement.index).key]

  if (hasOldFragmentInCreatedChildren) {
    createdChildren.removeFragment(currentKeyedElement.index)
  }

  createdFragment.fragmentChildKeys = {
    ...createdFragment.fragmentChildKeys,
    [key]: childIndex
  }
  delete oldKeyElementMap[key]
}

export const fragmentMoveCallback = (
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
): void => {
  return renderTypeSwitch(
    () => {
      removeChildFromIndexPosition(
        removedChild => {
          createdChildren.remove(removedChild.index)
          if (!removedChild.key || !oldKeyElementMap[removedChild.key]) {
            unsubscribe(removedChild)
          }
        },
        childIndex,
        element,
        createdChildren
      )
      moveFragment(
        currentKeyedElement,
        oldKeyElementMap,
        createdFragment,
        childIndex,
        element,
        createdChildren
      )()
    },
    existingFragment => {
      removeExistingFragment(
        oldKeyElementMap,
        childIndex,
        element,
        createdChildren
      )(existingFragment)

      moveFragment(
        currentKeyedElement,
        oldKeyElementMap,
        createdFragment,
        childIndex,
        element,
        createdChildren
      )()
    },
    moveFragment(
      currentKeyedElement,
      oldKeyElementMap,
      createdFragment,
      childIndex,
      element,
      createdChildren
    )
  )(childIndex, createdChildren)
}
