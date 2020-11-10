import type {
  RvdChildrenManager,
  CreatedFragmentChild,
  Dictionary,
  KeyedChild,
  RenderNewChildCallbackFn,
  RvdElement,
  RvdContext
} from '../../shared/types'
import { getFlattenFragmentChildren, unsubscribe } from './utils'
import { fragmentMoveCallback } from './move-callback/fragment'
import { elementMoveCallback } from './move-callback/element'
import { arrayReduce } from '../../shared'

/**
 * Called when new fragment (or array) appears in place of existing fragment. Load
 * references to currently rendered elements with keys from existing fragment. They
 * will be used later for skipping rendering or moving element to other place
 * instead of re-rendering whole fragment (or array)
 * @param manager
 * @param createdFragment
 */
export function loadPreviousKeyedElements(
  manager: RvdChildrenManager,
  createdFragment: CreatedFragmentChild
): Dictionary<KeyedChild> {
  if (createdFragment.oldKeyElementMap) {
    for (const key in createdFragment.oldKeyElementMap) {
      const oldKeyedChild = createdFragment.oldKeyElementMap[key]
      if (oldKeyedChild.fragmentChildren) {
        for (let i = 0, l = oldKeyedChild.fragmentChildren.length; i < l; ++i) {
          unsubscribe(oldKeyedChild.fragmentChildren[i])
        }
      }
      unsubscribe(oldKeyedChild.child)
    }
  }

  createdFragment.oldKeyElementMap = {}

  for (const key in createdFragment.fragmentChildKeys) {
    const index = createdFragment.fragmentChildKeys[key]
    const child = manager.children[index] || manager.fragmentChildren[index]

    createdFragment.oldKeyElementMap[key] = {
      index,
      child,
      fragmentChildren:
        child &&
        child.fragmentChildIndexes &&
        arrayReduce(child.fragmentChildIndexes, getFlattenFragmentChildren(manager), [])
    }
  }

  return createdFragment.oldKeyElementMap
}

/**
 * Skip rendering keyed child - function is called, when child with the same key
 * appears in the same position - just adding child's key - index entry to created
 * fragment's fragmentChildKeys dictionary
 * @param oldKeyElementMap
 * @param createdFragment
 * @param childIndex
 * @param key
 */
export function refreshFragmentChildKey(
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  key: string | number
): void {
  createdFragment.fragmentChildKeys[key] = childIndex

  delete oldKeyElementMap[key]
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
  child: RvdElement,
  childIndex: string,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  element: Element,
  manager: RvdChildrenManager,
  context: RvdContext,
  renderNewCallback: RenderNewChildCallbackFn
): void {
  const key = child.key
  const currentKeyedElement = oldKeyElementMap[key]
  if (currentKeyedElement) {
    // Has keyed Element saved - Element with the same key were rendered in previous iteration
    if (currentKeyedElement.child.element && currentKeyedElement.child.type !== child.type) {
      refreshFragmentChildKey(oldKeyElementMap, createdFragment, childIndex, key)
      return renderNewCallback(child, childIndex, context, createdFragment)
    } else if (currentKeyedElement.index === childIndex) {
      // Rendered on the same position as current - skip rendering
      return refreshFragmentChildKey(oldKeyElementMap, createdFragment, childIndex, key)
    } else {
      // Rendered on different position - move Element or nested Fragment
      if (currentKeyedElement.child.element) {
        // Move rendered Element to new position
        elementMoveCallback(
          currentKeyedElement,
          oldKeyElementMap,
          createdFragment,
          childIndex,
          element,
          manager
        )
      } else {
        // Move rendered nested Fragment to new position
        fragmentMoveCallback(
          currentKeyedElement,
          oldKeyElementMap,
          createdFragment,
          childIndex,
          element,
          manager
        )
      }
    }
  } else {
    // Hasn't keyed Element saved, render new child and save with key
    createdFragment.fragmentChildKeys[key] = childIndex
    renderNewCallback(child, childIndex, context, createdFragment)
  }
}
