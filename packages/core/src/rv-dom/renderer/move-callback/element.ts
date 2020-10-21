import type {
  CreatedChildrenManager,
  CreatedFragmentChild,
  CreatedNodeChild,
  Dictionary,
  KeyedChild
} from '../../../shared/types'
import { renderTypeSwitch, unsubscribe } from '../utils'
import {
  renderChildInIndexPosition,
  replaceChildOnIndexPosition,
  removeExistingFragment
} from '../dom-renderer'
import { updateKeyedChild } from './utils'

type MoveElement = (
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
) => void

type SwitchElement = (
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
) => (existingChild: CreatedNodeChild) => void

const moveElement: MoveElement = (
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
        key: currentKeyedElement.child.key,
        subscription: currentKeyedElement.child.subscription,
        type: currentKeyedElement.child.type,
        isText: currentKeyedElement.child.isText
      })
      updateKeyedChild(
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
        subscription: currentKeyedElement.child.subscription,
        type: currentKeyedElement.child.type,
        isText: currentKeyedElement.child.isText
      })

      updateKeyedChild(
        currentKeyedElement,
        oldKeyElementMap,
        createdFragment,
        childIndex,
        createdChildren
      )
    },
    currentKeyedElement.child.element as Element | Text,
    element,
    existingChild
  )
}

export const elementMoveCallback = (
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
): void => {
  const move = () =>
    moveElement(
      currentKeyedElement,
      oldKeyElementMap,
      createdFragment,
      childIndex,
      element,
      createdChildren
    )

  return renderTypeSwitch(
    switchElement(
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

      move()
    },
    move
  )(childIndex, createdChildren)
}
