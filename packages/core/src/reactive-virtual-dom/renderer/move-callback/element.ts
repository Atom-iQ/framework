import type { RvdChildrenManager, RvdCreatedFragment, RvdCreatedNode } from '../../../shared/types'
import { unsubscribe } from '../utils'
import { renderChildInIndexPosition, removeExistingFragment } from '../dom-renderer'
import { updateKeyedChild } from './utils'
import { setCreatedChild } from '../children-manager'

export function elementMoveCallback(
  currentKeyedElement: RvdCreatedNode,
  createdFragment: RvdCreatedFragment,
  newChildIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager
): void {
  if (manager.children[newChildIndex]) {
    switchElement(
      manager.children[newChildIndex],
      currentKeyedElement,
      createdFragment,
      newChildIndex,
      parentElement,
      manager
    )
  } else {
    if (manager.fragmentChildren[newChildIndex]) {
      removeExistingFragment(
        manager.fragmentChildren[newChildIndex],
        newChildIndex,
        parentElement,
        manager,
        createdFragment.oldKeys
      )
    }

    moveElement(currentKeyedElement, createdFragment, newChildIndex, parentElement, manager)
  }
}

function moveElement(
  currentKeyedElement: RvdCreatedNode,
  createdFragment: RvdCreatedFragment,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager
): void {
  renderChildInIndexPosition(currentKeyedElement.element, childIndex, parentElement, manager)
  setCreatedChild(
    manager,
    childIndex,
    {
      index: childIndex,
      element: currentKeyedElement.element,
      key: currentKeyedElement.key,
      subscription: currentKeyedElement.subscription,
      type: currentKeyedElement.type,
      isText: currentKeyedElement.isText
    },
    createdFragment
  )

  updateKeyedChild(currentKeyedElement, createdFragment, childIndex, manager)
}

function switchElement(
  existingChild: RvdCreatedNode,
  currentKeyedElement: RvdCreatedNode,
  createdFragment: RvdCreatedFragment,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager
): void {
  parentElement.replaceChild(currentKeyedElement.element, existingChild.element)
  if (existingChild.key && createdFragment.oldKeys[existingChild.key]) {
    manager.removedNodes[childIndex] = existingChild
  } else {
    unsubscribe(existingChild)
  }

  setCreatedChild(manager, childIndex, {
    index: childIndex,
    element: currentKeyedElement.element,
    key: currentKeyedElement.key,
    subscription: currentKeyedElement.subscription,
    type: currentKeyedElement.type,
    isText: currentKeyedElement.isText
  })

  updateKeyedChild(currentKeyedElement, createdFragment, childIndex, manager)
}
