import type {
  CreatedChildrenManager,
  CreatedFragmentChild,
  Dictionary,
  KeyedChild,
  RenderNewChildCallbackFn,
  RvdFragmentElement,
  RxSub
} from '../../shared/types'
import {
  loadPreviousKeyedElements,
  renderFragmentChild,
  renderNonKeyedStaticFragmentChild,
  skipMoveOrRenderKeyedChild
} from './fragment-children'
import { removeChildFromIndexPosition, removeExistingFragment } from './dom-renderer'
import { unsubscribe } from './utils'
import { RvdChildFlags, RvdElementFlags } from '../../shared/flags'

/**
 * Remove excessive fragment children - when new returned Fragment has less children,
 * than currently rendered, remove excessive from DOM and created children manager.
 * If child reference is not saved with key - also unsubscribe - if it's saved with key,
 * don't unsubscribe - reference is removed from created children, but is still available
 * in saved keyed elements - when new children includes element with same key, renderer
 * will take element from saved keyed elements, append it on new position and re-attach
 * it's subscription to new element
 * @param fragmentIndex
 * @param element
 * @param createdChildren
 * @param rvdFragmentElement
 * @param oldKeyElementMap
 * @param createdFragment
 */
const removeExcessiveChildren = (
  fragmentIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  rvdFragmentElement: RvdFragmentElement,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild
) => {
  const previousChildrenLength = createdFragment.fragmentChildrenLength
  const newChildrenLength = rvdFragmentElement.children.length

  if (previousChildrenLength > newChildrenLength) {
    const toRemoveCount = previousChildrenLength - newChildrenLength
    Array.from({ length: toRemoveCount }, (_, i) => i + newChildrenLength).forEach(index => {
      const childIndex = `${fragmentIndex}.${index}`
      if (createdChildren.has(childIndex)) {
        const existingChild = createdChildren.get(childIndex)
        removeChildFromIndexPosition(
          () => {
            if (!existingChild.key || !oldKeyElementMap[existingChild.key]) {
              unsubscribe(existingChild)
            }

            createdChildren.remove(existingChild.index)
          },
          childIndex,
          element,
          existingChild.element
        )
      } else if (createdChildren.hasFragment(childIndex)) {
        removeExistingFragment(
          oldKeyElementMap,
          childIndex,
          element,
          createdChildren
        )(createdChildren.getFragment(childIndex))
      }
    })
  }
}

/**
 * Reactive Virtual DOM Fragment Renderer
 *
 * Called for Fragments and arrays (transformed internally to RvdFragmentElement), creates
 * Fragment Rendering Context, inside parent's Element Rendering Context.
 * Managing Fragment/Array children position - re-creating all children on re-call for non
 * keyed Fragments or skip rendering/move/remove/create for keyed Fragments
 *
 * @param fragmentIndex
 * @param element
 * @param createdChildren
 * @param childrenSubscription
 * @param renderNewCallback
 */
export function renderRvdFragment(
  fragmentIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub,
  renderNewCallback: RenderNewChildCallbackFn
): (rvdFragmentElement: RvdFragmentElement) => void {
  return (rvdFragmentElement: RvdFragmentElement) => {
    // Get Fragment Rendering Context data
    const createdFragment = createdChildren.getFragment(fragmentIndex)
    // JSX plugin could set RvdElementFlags.NonKeyedFragment, when every child is static and non-keyed
    const isNonKeyedFragment = rvdFragmentElement.elementFlag === RvdElementFlags.NonKeyedFragment
    // Load currently rendered created keyed elements references
    // or set as empty object for non-keyed fragment
    const oldKeyElementMap = isNonKeyedFragment
      ? {}
      : loadPreviousKeyedElements(createdChildren, createdFragment)
    // Reset actual fragment child keys map before calling renderer for children
    createdFragment.fragmentChildKeys = {}
    // Remove excessive children from DOM, when new fragment has less children then currently rendered
    removeExcessiveChildren(
      fragmentIndex,
      element,
      createdChildren,
      rvdFragmentElement,
      oldKeyElementMap,
      createdFragment
    )
    // Call proper renderer function for each fragment child
    rvdFragmentElement.children.forEach(
      isNonKeyedFragment
        ? renderNonKeyedStaticFragmentChild(fragmentIndex, renderNewCallback)
        : renderFragmentChild(
            fragmentIndex,
            childrenSubscription,
            (rvdFragmentElement.childFlags & RvdChildFlags.HasOnlyStaticChildren) !== 0,
            skipMoveOrRenderKeyedChild(
              oldKeyElementMap,
              createdFragment,
              element,
              createdChildren,
              renderNewCallback
            ),
            renderNewCallback
          )
    )
    // Save new fragment children length
    createdFragment.fragmentChildrenLength = rvdFragmentElement.children.length
  }
}
