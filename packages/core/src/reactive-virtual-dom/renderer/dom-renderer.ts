import type { RvdChildrenManager, CreatedNodeChild } from '../../shared/types'
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
} from './children-manager'
import { arrayLoop, arrayReduce } from '../../shared'

export function renderChildInIndexPosition(
  childElement: Element | Text,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  createdFragment?: CreatedFragmentChild
): void {
  // Element children Append mode - initial element children render, appending all elements
  if (manager.isInAppendMode || createdChildrenSize(manager) === 0) {
    // Easiest case - add as first added child
    appendChild(parentElement, childElement)
  } else if (createdFragment && createdFragment.isInFragmentAppendMode) {
    if (createdFragment.fragmentAppend) {
      appendChild(parentElement, childElement)
    } else if (createdFragment.nextSibling) {
      insertBefore(parentElement, childElement, createdFragment.nextSibling)
    }
  } else {
    // To know the exact position, where new child should be inserted, we are looking for
    // reference to previous sibling in children manager - only after finishing appendMode,
    // initial children rendering
    const previousSibling = getPreviousSibling(manager, childIndex)
    if (!previousSibling) {
      insertBefore(parentElement, childElement, parentElement.firstChild)
    } else if (previousSibling.nextSibling) {
      insertBefore(parentElement, childElement, previousSibling.nextSibling)
    } else {
      appendChild(parentElement, childElement)
    }
  }
}

export const removeExistingFragment = (
  oldKeyElementMap: Dictionary<KeyedChild> | null,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  parentFragment?: CreatedFragmentChild
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
  removeCreatedFragment(manager, childIndex, parentFragment)
}

export function setClassName(
  isSvg: boolean,
  element: HTMLElement | SVGElement,
  className: string | null
): void {
  if (isSvg) {
    if (className) {
      element.setAttribute('class', className)
    } else {
      element.removeAttribute('class')
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;(element as HTMLElement).className = className
  }
}
