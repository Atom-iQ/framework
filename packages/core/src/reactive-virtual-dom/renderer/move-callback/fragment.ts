import type { RvdChildrenManager, RvdCreatedFragment, RvdCreatedNode } from 'types'
import { renderChildInIndexPosition, removeExistingFragment } from '../dom-renderer'
import { unsubscribe } from '../utils'
import { updateKeyedChild } from './utils'
import { removeCreatedChild, setCreatedChild, setCreatedFragment } from '../children-manager'

/**
 * Moves fragment to `childIndex` position. If something is rendered on
 * that position, removes it from DOM (if it's keyed)
 * @param fragmentToMove fragment to move
 * @param createdFragment parent fragment
 * @param childIndex index where fragment should be moved
 * @param parentElement parent DOM Element
 * @param manager children manager
 */
export function fragmentMoveCallback(
  fragmentToMove: RvdCreatedFragment,
  createdFragment: RvdCreatedFragment,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager
): void {
  if (manager.children[childIndex]) {
    const existingChild = manager.children[childIndex]
    parentElement.removeChild(existingChild.element)
    if (existingChild.key && createdFragment.oldKeys[existingChild.key]) {
      manager.removedNodes[childIndex] = existingChild
    } else {
      unsubscribe(existingChild)
    }
    removeCreatedChild(manager, existingChild.index, createdFragment)
  } else if (manager.fragmentChildren[childIndex]) {
    removeExistingFragment(
      manager.fragmentChildren[childIndex],
      childIndex,
      parentElement,
      manager,
      createdFragment.oldKeys
    )
  }

  moveFragment(fragmentToMove, createdFragment, childIndex, parentElement, manager)
}

function moveFragment(
  fragmentToMove: RvdCreatedFragment,
  createdFragment: RvdCreatedFragment,
  childIndex: string,
  element: Element,
  manager: RvdChildrenManager
) {
  const key: string | number = fragmentToMove.key
  const childIndexPartsLength = childIndex.split('.').length

  const indexes = fragmentToMove.indexes
  let fragmentChild: RvdCreatedNode | RvdCreatedFragment,
    fragmentChildIndexRest: string,
    newChildIndex: string

  for (let i = 0; i < indexes.length; ++i) {
    if (manager.removedNodes[indexes[i]] || manager.children[indexes[i]]) {
      fragmentChild = manager.removedNodes[indexes[i]] || manager.children[indexes[i]]
      fragmentChildIndexRest = fragmentChild.index.split('.').slice(childIndexPartsLength).join('.')

      newChildIndex = `${childIndex}.${fragmentChildIndexRest}`

      renderChildInIndexPosition(fragmentChild.element, newChildIndex, element, manager)
      setCreatedChild(
        manager,
        newChildIndex,
        {
          index: newChildIndex,
          element: fragmentChild.element,
          key: fragmentChild.key,
          subscription: fragmentChild.subscription,
          type: fragmentChild.type,
          isText: fragmentChild.isText
        },
        createdFragment
      )

      if (manager.children[fragmentChild.index]) {
        removeCreatedChild(manager, fragmentChild.index, createdFragment)
      }
    } else if (manager.removedFragments[indexes[i]] || manager.fragmentChildren[indexes[i]]) {
      fragmentChild = manager.removedFragments[indexes[i]] || manager.fragmentChildren[indexes[i]]
      fragmentChildIndexRest = fragmentChild.index.split('.').slice(childIndexPartsLength).join('.')

      newChildIndex = `${childIndex}.${fragmentChildIndexRest}`
      moveFragment(fragmentChild, createdFragment, newChildIndex, element, manager)
    }
  }

  updateKeyedChild(fragmentToMove, createdFragment, childIndex, manager, true)

  setCreatedFragment(
    manager,
    childIndex,
    {
      ...(fragmentToMove as RvdCreatedFragment),
      index: childIndex,
      key
    },
    createdFragment
  )
}
