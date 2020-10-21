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
  if (createdChildren.empty()) {
    // Easiest case - add as first added child
    appendChild(parentElement, childElement)
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
  successCallback({ index: childIndex, element: childElement })
}

export function replaceChildOnIndexPosition(
  successCallback: RendererSuccessCallback,
  childElement: Element | Text,
  parentElement: Element,
  existingChild: CreatedNodeChild
): void {
  replaceChild(parentElement, childElement, existingChild.element)
  successCallback({ index: existingChild.index, element: childElement })
}

export function removeChildFromIndexPosition(
  successCallback: RendererSuccessCallback,
  parentElement: Element,
  existingElement: Element | Text
): void {
  removeChild(parentElement, existingElement)
  successCallback()
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
        element,
        existingChild.element
      )
    })

  if (!isSavedWithKey) {
    unsubscribe(existingFragment)
  }
  createdChildren.removeFragment(childIndex)
}
