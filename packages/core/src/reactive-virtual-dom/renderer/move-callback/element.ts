import type {
  RvdChildrenManager,
  CreatedFragmentChild,
  CreatedNodeChild,
  Dictionary,
  KeyedChild
} from '../../../shared/types'
import { unsubscribe } from '../utils'
import { renderChildInIndexPosition, removeExistingFragment } from '../dom-renderer'
import { updateKeyedChild } from './utils'
import { setCreatedChild } from '../children-manager'

export function elementMoveCallback(
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager
): void {
  const move = () =>
    moveElement(
      currentKeyedElement,
      oldKeyElementMap,
      createdFragment,
      childIndex,
      parentElement,
      manager
    )

  if (childIndex in manager.children) {
    switchElement(
      manager.children[childIndex],
      currentKeyedElement,
      oldKeyElementMap,
      createdFragment,
      childIndex,
      parentElement,
      manager
    )
  } else if (childIndex in manager.fragmentChildren) {
    removeExistingFragment(
      manager.fragmentChildren[childIndex],
      oldKeyElementMap,
      childIndex,
      parentElement,
      manager
    )
    move()
  } else {
    move()
  }
}

function moveElement(
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager
): void {
  renderChildInIndexPosition(currentKeyedElement.child.element, childIndex, parentElement, manager)
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

function switchElement(
  existingChild: CreatedNodeChild,
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager
): void {
  parentElement.replaceChild(currentKeyedElement.child.element, existingChild.element)
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
