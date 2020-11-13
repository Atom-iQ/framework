import type {
  RvdChildrenManager,
  RenderNewChildCallbackFn,
  RvdContext,
  RvdFragmentNode,
  RvdCreatedFragment
} from '../../../shared/types'
import { unsubscribe } from '../utils'
import { renderRvdFragment } from '../fragment'
import { Subscription } from 'rxjs'
import { createEmptyFragment, removeCreatedChild } from '../children-manager'

export function fragmentRenderCallback(
  child: RvdFragmentNode,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  childrenSubscription: Subscription,
  context: RvdContext,
  isStatic: boolean,
  renderNewCallback: RenderNewChildCallbackFn,
  parentFragment?: RvdCreatedFragment
): void {
  if (
    isStatic ||
    manager.append ||
    (parentFragment && parentFragment.append) ||
    !manager.fragmentChildren[childIndex]
  ) {
    createEmptyFragment(manager, childIndex, parentFragment)
  }

  if (manager.children[childIndex]) {
    const existingChild = manager.children[childIndex]
    parentElement.removeChild(existingChild.element)
    unsubscribe(existingChild)
    removeCreatedChild(manager, existingChild.index, parentFragment)
  }

  renderRvdFragment(
    child,
    childIndex,
    parentElement,
    manager,
    childrenSubscription,
    context,
    renderNewCallback
  )
}
