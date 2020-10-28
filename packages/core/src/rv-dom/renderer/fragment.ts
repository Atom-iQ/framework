import type {
  CreatedChildrenManager,
  CreatedFragmentChild,
  Dictionary,
  KeyedChild,
  RenderNewChildCallbackFn,
  RvdContext,
  RvdFragmentElement
} from '../../shared/types'
import {
  loadPreviousKeyedElements,
  renderFragmentChild,
  skipMoveOrRenderKeyedChild
} from './fragment-children'
import { removeExistingFragment } from './dom-renderer'
import { removeChild, unsubscribe } from './utils'
import { RvdChildFlags, RvdElementFlags } from '../..'
import { Subscription } from 'rxjs'
import { removeCreatedChild } from './utils/children-manager'
import { arrayLoop, loop } from '../../shared'

/**
 * Remove excessive fragment children - when new returned Fragment has less children,
 * than currently rendered, remove excessive from DOM and created children manager.
 * If child reference is not saved with key - also unsubscribe - if it's saved with key,
 * don't unsubscribe - reference is removed from created children, but is still available
 * in saved keyed elements - when new children includes element with same key, renderer
 * will take element from saved keyed elements, append it on new position and re-attach
 * it's subscription to new element
 * @param fragmentIndex
 * @param parentElement
 * @param manager
 * @param rvdFragmentElement
 * @param oldKeyElementMap
 * @param createdFragment
 */
const removeExcessiveChildren = (
  fragmentIndex: string,
  parentElement: Element,
  manager: CreatedChildrenManager,
  rvdFragmentElement: RvdFragmentElement,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild
): void => {
  const previousChildrenLength = createdFragment.fragmentChildrenLength
  const newChildrenLength = rvdFragmentElement.children.length

  if (previousChildrenLength > newChildrenLength) {
    loop(
      previousChildrenLength - newChildrenLength,
      i => {
        const childIndex = `${fragmentIndex}.${i}`
        const existingChild = manager.children[childIndex]
        if (existingChild) {
          removeChild(parentElement, existingChild.element)
          if (!existingChild.key || !oldKeyElementMap[existingChild.key]) {
            unsubscribe(existingChild)
          }
          removeCreatedChild(manager, existingChild.index)
        } else if (manager.fragmentChildren[childIndex]) {
          removeExistingFragment(
            oldKeyElementMap,
            childIndex,
            parentElement,
            manager
          )(manager.fragmentChildren[childIndex])
        }
      },
      newChildrenLength
    )
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
 * @param manager
 * @param childrenSubscription
 * @param context
 * @param renderNewCallback
 */
export function renderRvdFragment(
  fragmentIndex: string,
  element: Element,
  manager: CreatedChildrenManager,
  childrenSubscription: Subscription,
  context: RvdContext,
  renderNewCallback: RenderNewChildCallbackFn
): (rvdFragmentElement: RvdFragmentElement) => void {
  return (rvdFragmentElement: RvdFragmentElement) => {
    // Get Fragment Rendering Context data
    const createdFragment = manager.fragmentChildren[fragmentIndex]
    // JSX plugin could set RvdElementFlags.NonKeyedFragment, when every child is static and non-keyed
    const isNonKeyedFragment = rvdFragmentElement.elementFlag === RvdElementFlags.NonKeyedFragment
    // Load currently rendered created keyed elements references
    // or set as empty object for non-keyed fragment
    const oldKeyElementMap = isNonKeyedFragment
      ? {}
      : loadPreviousKeyedElements(manager, createdFragment)
    // Reset actual fragment child keys map before calling renderer for children
    createdFragment.fragmentChildKeys = {}
    // Remove excessive children from DOM, when new fragment has less children then currently rendered
    removeExcessiveChildren(
      fragmentIndex,
      element,
      manager,
      rvdFragmentElement,
      oldKeyElementMap,
      createdFragment
    )
    // Call proper renderer function for each fragment child
    arrayLoop(
      rvdFragmentElement.children,
      renderFragmentChild(
        fragmentIndex,
        childrenSubscription,
        context,
        isNonKeyedFragment
          ? 2
          : rvdFragmentElement.childFlags & RvdChildFlags.HasOnlyStaticChildren
          ? 1
          : 0,
        skipMoveOrRenderKeyedChild(
          oldKeyElementMap,
          createdFragment,
          element,
          manager,
          renderNewCallback
        ),
        renderNewCallback
      )
    )
    // Save new fragment children length
    createdFragment.fragmentChildrenLength = rvdFragmentElement.children.length
  }
}
