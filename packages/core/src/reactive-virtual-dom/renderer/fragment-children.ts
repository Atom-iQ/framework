import type {
  RvdChildrenManager,
  RvdCreatedFragment,
  RenderNewChildCallbackFn,
  RvdNode,
  RvdContext
} from 'types'
import { unsubscribe } from './utils'
import { fragmentMoveCallback } from './move-callback/fragment'
import { elementMoveCallback } from './move-callback/element'

/**
 * Called when new fragment (or array) appears in place of existing fragment. Load
 * references to currently rendered elements with keys from existing fragment. They
 * will be used later for skipping rendering or moving element to other place
 * instead of re-rendering whole fragment (or array)
 * @param manager
 * @param createdFragment
 */
export function reloadKeys(manager: RvdChildrenManager, createdFragment: RvdCreatedFragment): void {
  if (createdFragment.oldKeys) {
    for (const key in createdFragment.oldKeys) {
      const index = createdFragment.oldKeys[key]
      if (manager.removedNodes[index]) {
        unsubscribe(manager.removedNodes[index])
        delete manager.removedNodes[index]
      } else if (manager.removedFragments[index]) {
        unsubscribeRemovedFragment(manager.removedFragments[index], manager)
        delete manager.removedFragments[index]
      }
    }
  }

  createdFragment.oldKeys = createdFragment.keys
}

function unsubscribeRemovedFragment(fragment: RvdCreatedFragment, manager: RvdChildrenManager) {
  for (let i = 0, l = fragment.indexes.length; i < l; ++i) {
    const index = fragment.indexes[i]
    if (manager.removedNodes[index]) {
      unsubscribe(manager.removedNodes[index])
      delete manager.removedNodes[index]
    } else if (manager.removedFragments[index]) {
      unsubscribeRemovedFragment(manager.removedFragments[index], manager)
      delete manager.removedFragments[index]
    }
  }
}

/**
 * Check if element with the same key as new child is in oldKeyElementMap. If yes, it means
 * that it is currently rendered in DOM and should be skipped if it's on the same position
 * or moved if it's position is changed, instead of re-creating element. If element wasn't
 * rendered, call renderNewCallback - standard rendering logic
 * @param child
 * @param childIndex
 * @param oldKeyElementMap
 * @param createdFragment
 * @param element
 * @param manager
 * @param renderNewCallback
 */
export function skipMoveOrRenderKeyedChild(
  child: RvdNode,
  childIndex: string,
  createdFragment: RvdCreatedFragment,
  element: Element,
  manager: RvdChildrenManager,
  context: RvdContext,
  renderNewCallback: RenderNewChildCallbackFn
): void {
  const key = child.key
  const oldIndex: string = createdFragment.oldKeys && createdFragment.oldKeys[key]
  if (oldIndex) {
    if (manager.removedNodes[oldIndex] || manager.children[oldIndex]) {
      const elementToMove = manager.removedNodes[oldIndex] || manager.children[oldIndex]
      if (elementToMove.type !== child.type) {
        // Has element saved, but with different type - re-render
        createdFragment.keys[key] = childIndex
        delete createdFragment.oldKeys[key]
        renderNewCallback(child, childIndex, context, createdFragment)
      } else if (elementToMove.index === childIndex) {
        // Rendered on the same position as current - skip rendering
        createdFragment.keys[key] = childIndex
        delete createdFragment.oldKeys[key]
      } else {
        // Move rendered Element to new position
        elementMoveCallback(elementToMove, createdFragment, childIndex, element, manager)
      }
    } else if (manager.removedFragments[oldIndex] || manager.fragmentChildren[oldIndex]) {
      const fragmentToMove =
        manager.removedFragments[oldIndex] || manager.fragmentChildren[oldIndex]
      if (fragmentToMove.index === childIndex) {
        // Rendered on the same position as current - skip rendering
        createdFragment.keys[key] = childIndex
        delete createdFragment.oldKeys[key]
      } else {
        fragmentMoveCallback(fragmentToMove, createdFragment, childIndex, element, manager)
      }
    }
  } else {
    // Hasn't keyed Element saved, render new child and save with key
    createdFragment.keys[key] = childIndex
    renderNewCallback(child, childIndex, context, createdFragment)
  }
}
