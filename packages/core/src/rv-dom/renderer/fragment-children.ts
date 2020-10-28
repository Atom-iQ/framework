import type {
  CreatedChildrenManager,
  CreatedFragmentChild,
  CreatedNodeChild,
  Dictionary,
  KeyedChild,
  RenderNewChildCallbackFn,
  RvdChild,
  RvdContext,
  RvdElement
} from '../../shared/types'
import { isObservable, Subscription } from 'rxjs'
import { getFlattenFragmentChildren, isRvdElement, unsubscribe } from './utils'
import { fragmentMoveCallback } from './move-callback/fragment'
import { elementMoveCallback } from './move-callback/element'
import { objectLoop, arrayReduce, arrayLoop } from '../../shared'

/**
 * Called when new fragment (or array) appears in place of existing fragment. Load
 * references to currently rendered elements with keys from existing fragment. They
 * will be used later for skipping rendering or moving element to other place
 * instead of re-rendering whole fragment (or array)
 * @param manager
 * @param createdFragment
 */
export const loadPreviousKeyedElements = (
  manager: CreatedChildrenManager,
  createdFragment: CreatedFragmentChild
): Dictionary<KeyedChild> => {
  if (createdFragment.oldKeyElementMap) {
    objectLoop(createdFragment.oldKeyElementMap, oldKeyedChild => {
      if (oldKeyedChild.fragmentChildren) {
        arrayLoop(oldKeyedChild.fragmentChildren, unsubscribe)
      }
      unsubscribe(oldKeyedChild.child)
    })
  }

  createdFragment.oldKeyElementMap = {}

  objectLoop(createdFragment.fragmentChildKeys, (index, key) => {
    const child = manager.children[index] || manager.fragmentChildren[index]

    createdFragment.oldKeyElementMap[key] = {
      index,
      child,
      fragmentChildren:
        child &&
        child.fragmentChildIndexes &&
        arrayReduce(child.fragmentChildIndexes, getFlattenFragmentChildren(manager), [])
    }
  })

  return createdFragment.oldKeyElementMap
}

/**
 * Check type of fragment child and if child has a key and call different action:
 * - called when fragment has RvdElementFlags.Fragment flag - then it could have
 *   keyed/non-keyed static/Observable children
 * - if child has key, call keyedCallback (which will skip rendering, move or renderer
 *   keyed child)
 * - if has not key, call nonKeyedCallback (which will call standard logic for rendering
 *   observable child - even if it's static child - that's specific case for fragments
 *   and arrays, as elements can change, then it cannot just renderer child in it's
 *   position, but also check and remove/replace existing element on child's position)
 * @param fragmentIndex
 * @param childrenSubscription
 * @param context
 * @param isStatic
 * @param keyedCallback
 * @param nonKeyedCallback
 */
export const renderFragmentChild = (
  fragmentIndex: string,
  childrenSubscription: Subscription,
  context: RvdContext,
  isStatic: 0 | 1 | 2, // 0 - not static, 1 - static, maybe keyed, 2 - static non keyed
  keyedCallback: RenderNewChildCallbackFn,
  nonKeyedCallback: RenderNewChildCallbackFn
) => (child: RvdChild, index: number): void => {
  const childIndex = `${fragmentIndex}.${index}`

  if (isStatic === 2) {
    return nonKeyedCallback(child, childIndex, context)
  }

  const renderChild = fragmentChild => {
    if (isRvdElement(fragmentChild) && fragmentChild.key) {
      keyedCallback(fragmentChild, childIndex, context)
    } else {
      nonKeyedCallback(fragmentChild, childIndex, context)
    }
  }

  if (!isStatic && isObservable(child)) {
    childrenSubscription.add(child.subscribe(renderChild))
  } else {
    renderChild(child)
  }
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
export const refreshFragmentChildKey = (
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  key: string | number
): void => {
  createdFragment.fragmentChildKeys = {
    ...createdFragment.fragmentChildKeys,
    [key]: childIndex
  }

  delete oldKeyElementMap[key]
}

/**
 * Check if element with the same key as new child is in oldKeyElementMap. If yes, it means
 * that it is currently rendered in DOM and should be skipped if it's on the same position
 * or moved if it's position is changed, instead of re-creating element. If element wasn't
 * rendered, call renderNewCallback - standard rendering logic
 * @param oldKeyElementMap
 * @param createdFragment
 * @param element
 * @param manager
 * @param renderNewCallback
 */
export const skipMoveOrRenderKeyedChild = (
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  element: Element,
  manager: CreatedChildrenManager,
  renderNewCallback: RenderNewChildCallbackFn
) => (child: RvdElement, childIndex: string, context: RvdContext): void => {
  const key = child.key
  const currentKeyedElement = oldKeyElementMap[key]
  if (currentKeyedElement) {
    // Has keyed Element saved - Element with the same key were rendered in previous iteration
    if (currentKeyedElement.child.element && currentKeyedElement.child.type !== child.type) {
      refreshFragmentChildKey(oldKeyElementMap, createdFragment, childIndex, key)
      return renderNewCallback(child, childIndex, context)
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
    createdFragment.fragmentChildKeys = {
      ...createdFragment.fragmentChildKeys,
      [key]: childIndex
    }
    renderNewCallback(child, childIndex, context)
  }
}
