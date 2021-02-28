import type { RvdChildrenManager } from 'types'
import { unsubscribe } from './utils'
import { RvdCreatedFragment, Dictionary } from 'types'
import { getPreviousSibling, removeCreatedChild, removeCreatedFragment } from './children-manager'

export function renderChildInIndexPosition(
  childElement: Element | Text,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  createdFragment?: RvdCreatedFragment
): void {
  // Element children Append mode - initial element children render, appending all elements
  if (manager.append || manager.size === 0) {
    // Easiest case - add as first added child
    parentElement.appendChild(childElement)
  } else if (createdFragment && createdFragment.append) {
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
  existingFragment: RvdCreatedFragment,
  fragmentIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  oldKeys?: Dictionary<string>,
  parentFragment?: RvdCreatedFragment,
  saved?: boolean
): void {
  const isSavedWithKey =
    saved !== void 0 ? saved : !!(oldKeys && existingFragment.key && oldKeys[existingFragment.key])

  const indexes = existingFragment.indexes

  for (let i = 0; i < indexes.length; ++i) {
    if (manager.children[indexes[i]]) {
      const child = manager.children[indexes[i]]
      parentElement.removeChild(child.element)
      if (isSavedWithKey) {
        manager.removedNodes[child.index] = child
      } else {
        unsubscribe(child)
      }
      removeCreatedChild(manager, child.index)
    } else if (manager.fragmentChildren[indexes[i]]) {
      removeExistingFragment(
        manager.fragmentChildren[indexes[i]],
        indexes[i],
        parentElement,
        manager,
        undefined,
        undefined,
        isSavedWithKey
      )
    }
  }

  if (isSavedWithKey) manager.removedFragments[fragmentIndex] = existingFragment
  removeCreatedFragment(manager, fragmentIndex, parentFragment)
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
