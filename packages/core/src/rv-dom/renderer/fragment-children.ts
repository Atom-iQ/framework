import {
  CreatedChildrenManager,
  CreatedFragmentChild,
  CreatedNodeChild,
  Dictionary,
  KeyedChild,
  RenderNewChildCallbackFn,
  RvdChild,
  RvdElement,
  RxSub
} from '../../shared/types'
import { isObservable } from 'rxjs'
import { getFlattenFragmentChildren, isRvdElement, unsubscribe } from './utils'
import { _FRAGMENT } from '../../shared'
import { nestedFragmentMoveCallback } from './move-callback/fragment'
import { elementMoveCallback } from './move-callback/element'

/**
 * Check type of fragment child and if child has a key and call different action:
 * - if child has key, call keyedCallback (which will skip rendering, move or renderer
 *   keyed child)
 * - if has not key, call nonKeyedCallback (which will call standard logic for rendering
 *   observable child - even if it's static child - that's specific case for fragments
 *   and arrays, as elements can change, then it cannot just renderer child in it's
 *   position, but also check and remove/replace existing element on child's position)
 * @param fragmentIndex
 * @param childrenSubscription
 * @param keyedCallback
 * @param nonKeyedCallback
 */
export const renderFragmentChild = (
  fragmentIndex: string,
  childrenSubscription: RxSub,
  keyedCallback: (child: RvdChild, childIndex: string) => void,
  nonKeyedCallback: (child: RvdChild, childIndex: string) => void
) => (child: RvdChild, index: number): void => {
  const childIndex = `${fragmentIndex}.${index}`

  if (isObservable(child)) {
    const childSub = child.subscribe(observableChild => {
      if (isRvdElement(observableChild) && observableChild.key) {
        keyedCallback(observableChild, childIndex)
      } else {
        nonKeyedCallback(observableChild, childIndex)
      }
    })
    childrenSubscription.add(childSub)
  } else {
    if (isRvdElement(child) && child.key) {
      keyedCallback(child, childIndex)
    } else {
      nonKeyedCallback(child, childIndex)
    }
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
export const skipRenderingKeyedChild = (
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
  console.log('Skip rendering element with key: ', key)
}

const hasRemainingKeyedElements = (createdFragment: CreatedFragmentChild): boolean =>
  createdFragment.oldKeyElementMap && Object.keys(createdFragment.oldKeyElementMap).length > 0

/**
 * Called when new fragment (or array) appears in place of existing fragment. Load
 * references to currently rendered elements with keys from existing fragment. They
 * will be used later for skipping rendering or moving element to other place
 * instead of re-rendering whole fragment (or array)
 * @param createdChildren
 * @param createdFragment
 */
export const loadPreviousKeyedElements = (
  createdChildren: CreatedChildrenManager,
  createdFragment: CreatedFragmentChild
): Dictionary<KeyedChild> => {
  if (hasRemainingKeyedElements(createdFragment)) {
    Object.values(createdFragment.oldKeyElementMap).forEach((oldKeyedChild: KeyedChild) => {
      if (oldKeyedChild.fragmentChildren) {
        oldKeyedChild.fragmentChildren.forEach(fragmentChild => unsubscribe(fragmentChild))
      }
      unsubscribe(oldKeyedChild.child)
    })
  }

  createdFragment.oldKeyElementMap = Object.keys(createdFragment.fragmentChildKeys).reduce(
    (newMap, key) => {
      const index = createdFragment.fragmentChildKeys[key]

      const child = createdChildren.get(index) || createdChildren.getFragment(index)
      const fragmentChildren =
        child.fragmentChildIndexes &&
        (child.fragmentChildIndexes.reduce(
          getFlattenFragmentChildren(createdChildren),
          []
        ) as CreatedNodeChild[])

      newMap[key] = {
        index,
        child,
        fragmentChildren
      }

      return newMap
    },
    {}
  )

  return createdFragment.oldKeyElementMap
}

/**
 * Check if element with the same key as new child is in oldKeyElementMap. If yes, it means
 * that it is currently rendered in DOM and should be skipped if it's on the same position
 * or moved if it's position is changed, instead of re-creating element. If element wasn't
 * rendered, call renderNewCallback - standard rendering logic
 * @param oldKeyElementMap
 * @param createdFragment
 * @param element
 * @param createdChildren
 * @param renderNewCallback
 */
export const skipMoveOrRenderKeyedChild = (
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  element: Element,
  createdChildren: CreatedChildrenManager,
  renderNewCallback: RenderNewChildCallbackFn
) => (child: RvdElement, childIndex: string): void => {
  const currentKeyedElement = oldKeyElementMap[child.key]
  if (currentKeyedElement) {
    // Same element, on the same position
    if (currentKeyedElement.index === childIndex) {
      return skipRenderingKeyedChild(oldKeyElementMap, createdFragment, childIndex, child.key)
    } else {
      // Move fragment child (nested)
      if (currentKeyedElement.child.element === _FRAGMENT) {
        nestedFragmentMoveCallback(
          child,
          currentKeyedElement,
          oldKeyElementMap,
          createdFragment,
          childIndex,
          element,
          createdChildren
        )
      } else {
        elementMoveCallback(
          child,
          currentKeyedElement,
          oldKeyElementMap,
          createdFragment,
          childIndex,
          element,
          createdChildren
        )
      }

      console.log('Move child with key: ', child.key)
    }
  } else {
    createdFragment.fragmentChildKeys = {
      ...createdFragment.fragmentChildKeys,
      [child.key]: childIndex
    }
    console.log('Render child with key: ', child.key + ' : ' + childIndex)
    renderNewCallback(child, childIndex)
  }
}
