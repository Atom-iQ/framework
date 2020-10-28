import type {
  CreatedChildrenManager,
  CreatedFragmentChild,
  CreatedNodeChild,
  Dictionary,
  KeyedChild
} from '../../../shared/types'
import { renderTypeSwitch, replaceChild, unsubscribe } from '../utils'
import { renderChildInIndexPosition, removeExistingFragment } from '../dom-renderer'
import { updateKeyedChild } from './utils'
import { setCreatedChild } from '../utils/children-manager'

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
  manager
) => {
  renderChildInIndexPosition(
    newChild => {
      setCreatedChild(manager, childIndex, {
        ...newChild,
        key: currentKeyedElement.child.key,
        subscription: currentKeyedElement.child.subscription,
        type: currentKeyedElement.child.type,
        isText: currentKeyedElement.child.isText
      })

      updateKeyedChild(currentKeyedElement, oldKeyElementMap, createdFragment, childIndex, manager)
    },
    currentKeyedElement.child.element,
    childIndex,
    element,
    manager
  )
}

const switchElement: SwitchElement = (
  currentKeyedElement,
  oldKeyElementMap,
  createdFragment,
  childIndex,
  parentElement,
  manager
) => existingChild => {
  replaceChild(parentElement, currentKeyedElement.child.element, existingChild.element)
  if (!existingChild.key || !oldKeyElementMap[existingChild.key]) {
    unsubscribe(existingChild)
  }

  setCreatedChild(manager, childIndex, {
    index: childIndex,
    element: currentKeyedElement.child.element,
    key: currentKeyedElement.child.key,
    subscription: currentKeyedElement.child.subscription,
    type: currentKeyedElement.child.type,
    isText: currentKeyedElement.child.isText
  })

  updateKeyedChild(currentKeyedElement, oldKeyElementMap, createdFragment, childIndex, manager)
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
