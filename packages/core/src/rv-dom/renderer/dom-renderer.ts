import type { CreatedChildrenManager, CreatedNodeChild } from '../../shared/types'
import {
  appendChild,
  getFlattenFragmentChildren,
  insertBefore,
  removeChild,
  unsubscribe
} from './utils'
import { CreatedFragmentChild, Dictionary, KeyedChild } from '../../shared/types'
import {
  createdChildrenSize,
  getPreviousSibling,
  removeCreatedChild,
  removeCreatedFragment
} from './utils/children-manager'
import { arrayLoop, arrayReduce } from '../../shared'

type RendererSuccessCallback = (child?: CreatedNodeChild) => void

export function renderChildInIndexPosition(
  successCallback: RendererSuccessCallback,
  childElement: Element | Text,
  childIndex: string,
  parentElement: Element,
  manager: CreatedChildrenManager
): void {
  if (createdChildrenSize(manager) === 0) {
    // Easiest case - add as first added child
    appendChild(parentElement, childElement)
  } else {
    // To know the exact position, where new child should be inserted, we are sorting array
    // of existing children and new child indexes (indexes can be nested structures, sorting
    // have to be recursive)
    const previousSibling = getPreviousSibling(manager, childIndex)
    if (!previousSibling) {
      insertBefore(parentElement, childElement, parentElement.firstChild)
    } else if (previousSibling.nextSibling) {
      insertBefore(parentElement, childElement, previousSibling.nextSibling)
    } else {
      appendChild(parentElement, childElement)
    }
  }
  // TODO: Remove it, as it has no sense
  successCallback({ index: childIndex, element: childElement })
}

export const removeExistingFragment = (
  oldKeyElementMap: Dictionary<KeyedChild> | null,
  childIndex: string,
  parentElement: Element,
  manager: CreatedChildrenManager
) => (existingFragment: CreatedFragmentChild): void => {
  const isSavedWithKey =
    oldKeyElementMap && existingFragment.key && oldKeyElementMap[existingFragment.key]

  arrayLoop(
    arrayReduce(existingFragment.fragmentChildIndexes, getFlattenFragmentChildren(manager), []),
    (existingChild: CreatedNodeChild) => {
      removeChild(parentElement, existingChild.element)
      if (!isSavedWithKey) {
        unsubscribe(existingChild)
      }
      removeCreatedChild(manager, existingChild.index)
    }
  )

  if (!isSavedWithKey) {
    unsubscribe(existingFragment)
  }
  removeCreatedFragment(manager, childIndex)
}
