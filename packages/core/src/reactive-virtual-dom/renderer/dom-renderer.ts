import type { RvdChildrenManager } from '../../shared/types'
import { getFlattenFragmentChildren, unsubscribe } from './utils'
import { CreatedFragmentChild, Dictionary, KeyedChild } from '../../shared/types'
import { getPreviousSibling, removeCreatedChild, removeCreatedFragment } from './children-manager'
import { arrayReduce } from '../../shared'

export function renderChildInIndexPosition(
  childElement: Element | Text,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  createdFragment?: CreatedFragmentChild
): void {
  // Element children Append mode - initial element children render, appending all elements
  if (manager.isInAppendMode || manager.childrenLength === 0) {
    // Easiest case - add as first added child
    parentElement.appendChild(childElement)
  } else if (createdFragment && createdFragment.isInFragmentAppendMode) {
    if (createdFragment.nextSibling) {
      parentElement.insertBefore(childElement, createdFragment.nextSibling)
    } else {
      parentElement.appendChild(childElement)
    }
  } else {
    // To know the exact position, where new child should be inserted, we are looking for
    // reference to previous sibling in children manager - only after finishing appendMode,
    // initial children rendering
    const previousSibling = getPreviousSibling(manager, childIndex)
    if (!previousSibling) {
      parentElement.insertBefore(childElement, parentElement.firstChild)
    } else if (previousSibling.nextSibling) {
      parentElement.insertBefore(childElement, previousSibling.nextSibling)
    } else {
      parentElement.appendChild(childElement)
    }
  }
}

export function removeExistingFragment(
  existingFragment: CreatedFragmentChild,
  oldKeyElementMap: Dictionary<KeyedChild> | null,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  parentFragment?: CreatedFragmentChild
): void {
  const isSavedWithKey =
    oldKeyElementMap && existingFragment.key && oldKeyElementMap[existingFragment.key]

  const fragmentChildren = arrayReduce(
    existingFragment.fragmentChildIndexes,
    getFlattenFragmentChildren(manager),
    []
  )

  for (let i = 0, l = fragmentChildren.length; i < l; ++i) {
    parentElement.removeChild(fragmentChildren[i].element)
    if (!isSavedWithKey) {
      unsubscribe(fragmentChildren[i])
    }
    removeCreatedChild(manager, fragmentChildren[i].index)
  }

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
