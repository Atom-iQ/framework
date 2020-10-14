import type { CreatedChildrenManager, CreatedNodeChild } from '../../shared/types'
import {
  appendChild,
  getFlattenFragmentChildren,
  insertBefore,
  removeChild,
  replaceChild,
  unsubscribe
} from './utils'
import { CreatedFragmentChild, Dictionary, KeyedChild } from '../../shared/types'

type RendererSuccessCallback = (child?: CreatedNodeChild) => void

export function renderChildInIndexPosition(
  successCallback: RendererSuccessCallback,
  childElement: Element | Text,
  childIndex: string,
  parentElement: Element,
  createdChildren: CreatedChildrenManager
): void {
  // --------------------------------------------------------------------------------------------
  // Easiest case - add as first added child
  if (createdChildren.empty()) {
    appendChild(parentElement, childElement)
    // --------------------------------------------------------------------------------------------
    // Also easy case - add as second added child
  } else if (createdChildren.hasOneChild()) {
    const existingChildIndex = createdChildren.getFirstIndex()
    // If new child has higher index than existing child, append it as last element
    if (childIndex > existingChildIndex) {
      appendChild(parentElement, childElement)
      // Else - if new child has lower childIndex than existing child, prepend it as first element
    } else {
      const existingChild = createdChildren.getFirstChild()
      insertBefore(parentElement, childElement, existingChild.element)
    }
    // --------------------------------------------------------------------------------------------
    // More complicated case, there is more than one existing child currently connected to parent.
  } else {
    // To know the exact position, where new child should be inserted, we are sorting array
    // of existing children and new child indexes (indexes can be nested structures, sorting
    // have to be recursive)
    const { isFirst, isLast, nextSibling, firstChild } = createdChildren.getPositionInfoForNewChild(
      childIndex
    )
    // ------------------------------------------------------------------------------------------
    // If new child is first in sorted indexes, insert it as first child of parent Element
    if (isFirst) {
      insertBefore(parentElement, childElement, firstChild.element)
      // ------------------------------------------------------------------------------------------
      // If new child is last in sorted indexes, insert it as last child of parent Element
    } else if (isLast) {
      appendChild(parentElement, childElement)
      // ------------------------------------------------------------------------------------------
      // Otherwise, just get next sibling (it's just next child index in array)
      // and insert new element before it
    } else {
      insertBefore(parentElement, childElement, nextSibling.element)
    }
  }
  return successCallback({ index: childIndex, element: childElement })
}

export function replaceChildOnIndexPosition(
  successCallback: RendererSuccessCallback,
  childElement: Element | Text,
  parentElement: Element,
  existingChild: CreatedNodeChild
): void {
  if (replaceChild(parentElement, childElement, existingChild.element)) {
    return successCallback({ index: existingChild.index, element: childElement })
  }
}

export function removeChildFromIndexPosition(
  successCallback: RendererSuccessCallback,
  childIndex: string,
  parentElement: Element,
  existingElement: Element | Text
): void {
  if (removeChild(parentElement, existingElement)) {
    return successCallback()
  }
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
