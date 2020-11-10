import type {
  RvdChildrenManager,
  CreatedFragmentChild,
  CreatedNodeChild,
  Dictionary,
  KeyedChild
} from '../../../shared/types'
import { renderTypeSwitch, replaceChild, unsubscribe } from '../utils'
import { renderChildInIndexPosition, removeExistingFragment } from '../dom-renderer'
import { updateKeyedChild } from './utils'
import { setCreatedChild } from '../children-manager'

type MoveElement = (
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  createdChildren: RvdChildrenManager
) => void

type SwitchElement = (
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  createdChildren: RvdChildrenManager
) => (existingChild: CreatedNodeChild) => void

const moveElement: MoveElement = (
  currentKeyedElement,
  oldKeyElementMap,
  createdFragment,
  childIndex,
  element,
  manager
) => {
  renderChildInIndexPosition(currentKeyedElement.child.element, childIndex, element, manager)
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
  manager: RvdChildrenManager
): void => {
  const move = () =>
    moveElement(
      currentKeyedElement,
      oldKeyElementMap,
      createdFragment,
      childIndex,
      element,
      manager
    )

  return renderTypeSwitch(
    childIndex,
    manager,
    switchElement(
      currentKeyedElement,
      oldKeyElementMap,
      createdFragment,
      childIndex,
      element,
      manager
    ),
    existingFragment => {
      removeExistingFragment(oldKeyElementMap, childIndex, element, manager)(existingFragment)

      move()
    },
    move
  )
}
