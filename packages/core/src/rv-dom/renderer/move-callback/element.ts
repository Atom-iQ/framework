import { renderTypeSwitch, unsubscribe } from '../utils'
import { renderChildInIndexPosition, replaceChildOnIndexPosition } from '../dom-renderer'
import {
  CreatedChildrenManager,
  CreatedFragmentChild,
  CreatedNodeChild,
  Dictionary,
  KeyedChild
} from '../../../shared/types'
import { removeExistingFragment } from './utils'

type UpdateFragmentKeys = (
  key: string | number,
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  createdChildren: CreatedChildrenManager
) => void

type MoveElement = (
  key: string | number,
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
) => void

type SwitchElement = (
  key: string | number,
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
) => (existingChild: CreatedNodeChild) => void

const updateFragmentKeys: UpdateFragmentKeys = (
  key: string | number,
  currentKeyedElement,
  oldKeyElementMap,
  createdFragment,
  childIndex,
  createdChildren
) => {
  const hasOldElementInCreatedChildren =
    createdChildren.get(currentKeyedElement.index) &&
    createdChildren.get(currentKeyedElement.index).key === key

  if (hasOldElementInCreatedChildren) {
    createdChildren.remove(currentKeyedElement.index)
  }

  createdFragment.fragmentChildKeys = {
    ...createdFragment.fragmentChildKeys,
    [key]: childIndex
  }
  delete oldKeyElementMap[key]
}

const moveElement: MoveElement = (
  key: string | number,
  currentKeyedElement,
  oldKeyElementMap,
  createdFragment,
  childIndex,
  element,
  createdChildren
) => {
  renderChildInIndexPosition(
    newChild => {
      createdChildren.add(childIndex, {
        ...newChild,
        key,
        subscription: currentKeyedElement.child.subscription
      })
      updateFragmentKeys(
        key,
        currentKeyedElement,
        oldKeyElementMap,
        createdFragment,
        childIndex,
        createdChildren
      )
    },
    currentKeyedElement.child.element as Element | Text,
    childIndex,
    element,
    createdChildren
  )
}

const switchElement: SwitchElement = (
  key,
  currentKeyedElement,
  oldKeyElementMap,
  createdFragment,
  childIndex,
  element,
  createdChildren
) => existingChild => {
  replaceChildOnIndexPosition(
    newChild => {
      if (!existingChild.key || !oldKeyElementMap[existingChild.key]) {
        unsubscribe(existingChild)
      }

      createdChildren.replace(childIndex, {
        ...newChild,
        key: currentKeyedElement.child.key,
        subscription: currentKeyedElement.child.subscription
      })

      updateFragmentKeys(
        key,
        currentKeyedElement,
        oldKeyElementMap,
        createdFragment,
        childIndex,
        createdChildren
      )
    },
    currentKeyedElement.child.element as Element | Text,
    childIndex,
    element,
    createdChildren
  )
}

export const elementMoveCallback = (
  key: string | number,
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
): void => {
  return renderTypeSwitch(
    switchElement(
      key,
      currentKeyedElement,
      oldKeyElementMap,
      createdFragment,
      childIndex,
      element,
      createdChildren
    ),
    existingFragment => {
      removeExistingFragment(
        oldKeyElementMap,
        childIndex,
        element,
        createdChildren
      )(existingFragment)

      moveElement(
        key,
        currentKeyedElement,
        oldKeyElementMap,
        createdFragment,
        childIndex,
        element,
        createdChildren
      )
    },
    () =>
      moveElement(
        key,
        currentKeyedElement,
        oldKeyElementMap,
        createdFragment,
        childIndex,
        element,
        createdChildren
      )
  )(childIndex, createdChildren)
}
