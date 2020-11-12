import type {
  RvdChildrenManager,
  CreatedFragmentChild,
  Dictionary,
  KeyedChild,
  RenderNewChildCallbackFn,
  RvdContext,
  RvdFragmentElement,
  RvdObservableChild,
  RvdChild,
  RvdElement
} from '../../shared/types'
import { loadPreviousKeyedElements, skipMoveOrRenderKeyedChild } from './fragment-children'
import { removeExistingFragment } from './dom-renderer'
import { unsubscribe } from './utils'
// noinspection ES6PreferShortImport
import { RvdChildFlags, RvdElementFlags } from '../../shared/flags'
import { isObservable, Subscription } from 'rxjs'
import {
  removeCreatedChild,
  setFragmentAppendModeData,
  turnOffFragmentAppendMode
} from './children-manager'
import { loop } from '../../shared'

/**
 * Reactive Virtual DOM Fragment Renderer
 *
 * Called for Fragments and arrays (transformed internally to RvdFragmentElement), creates
 * Fragment Rendering Context, inside parent's Element Rendering Context.
 * Managing Fragment/Array children position - re-creating all children on re-call for non
 * keyed Fragments or skip rendering/move/remove/create for keyed Fragments
 *
 * @param rvdFragmentElement
 * @param fragmentIndex
 * @param parentElement
 * @param manager
 * @param childrenSubscription
 * @param context
 * @param renderNewCallback
 */
export function renderRvdFragment(
  rvdFragmentElement: RvdFragmentElement,
  fragmentIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  childrenSubscription: Subscription,
  context: RvdContext,
  renderNewCallback: RenderNewChildCallbackFn
): void {
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
  if (!manager.isInAppendMode && !createdFragment.isInFragmentAppendMode) {
    removeExcessiveChildren(
      fragmentIndex,
      parentElement,
      manager,
      rvdFragmentElement,
      oldKeyElementMap,
      createdFragment
    )
  }
  // Check if it's fragment scope append mode
  if (!manager.isInAppendMode && createdFragment.isInFragmentAppendMode) {
    setFragmentAppendModeData(createdFragment, fragmentIndex, parentElement, manager)
  }
  const childrenLength = rvdFragmentElement.children.length
  for (let i = 0; i < childrenLength; ++i) {
    const childIndex = fragmentIndex + '.' + i
    const child = rvdFragmentElement.children[i]
    if (isNonKeyedFragment) {
      renderNewCallback(child, childIndex, context, createdFragment)
    } else {
      const renderChild = function (fragmentChild: RvdChild) {
        if (fragmentChild && (fragmentChild as RvdElement).key) {
          skipMoveOrRenderKeyedChild(
            fragmentChild as RvdElement,
            childIndex,
            oldKeyElementMap,
            createdFragment,
            parentElement,
            manager,
            context,
            renderNewCallback
          )
        } else {
          renderNewCallback(child, childIndex, context, createdFragment)
        }
      }

      if (
        (rvdFragmentElement.childFlags & RvdChildFlags.HasOnlyStaticChildren) === 0 &&
        isObservable(child)
      ) {
        childrenSubscription.add((child as RvdObservableChild).subscribe(renderChild))
      } else {
        renderChild(child)
      }
    }
  }

  turnOffFragmentAppendMode(createdFragment)
  // Save new fragment children length
  createdFragment.fragmentChildrenLength = childrenLength
}

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
function removeExcessiveChildren(
  fragmentIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  rvdFragmentElement: RvdFragmentElement,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild
): void {
  const previousChildrenLength = createdFragment.fragmentChildrenLength
  const newChildrenLength = rvdFragmentElement.children.length

  if (previousChildrenLength > newChildrenLength) {
    loop(
      previousChildrenLength - newChildrenLength,
      i => {
        const childIndex = fragmentIndex + '.' + i
        const existingChild = manager.children[childIndex]
        if (existingChild) {
          parentElement.removeChild(existingChild.element)
          if (!existingChild.key || !oldKeyElementMap[existingChild.key]) {
            unsubscribe(existingChild)
          }
          removeCreatedChild(manager, existingChild.index, createdFragment)
        } else if (manager.fragmentChildren[childIndex]) {
          removeExistingFragment(
            manager.fragmentChildren[childIndex],
            oldKeyElementMap,
            childIndex,
            parentElement,
            manager,
            createdFragment
          )
        }
      },
      newChildrenLength
    )
  }

  if (
    !createdFragment.isInFragmentAppendMode &&
    createdFragment.fragmentChildIndexes.length === 0
  ) {
    createdFragment.isInFragmentAppendMode = true
  }
}
