import type {
  RvdChildrenManager,
  RenderNewChildCallbackFn,
  RvdContext,
  RvdFragmentNode,
  CreatedFragmentChild,
  CreatedNodeChild
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
  parentFragment?: CreatedFragmentChild
): void {
  const render = () =>
    renderRvdFragment(
      child,
      childIndex,
      parentElement,
      manager,
      childrenSubscription,
      context,
      renderNewCallback
    )

  const renderNew = () => {
    createEmptyFragment(manager, childIndex, parentFragment)
    render()
  }

  if (
    isStatic ||
    manager.isInAppendMode ||
    (parentFragment && parentFragment.isInFragmentAppendMode)
  ) {
    renderNew()
  } else if (childIndex in manager.children) {
    replaceElementForFragment(
      manager.children[childIndex],
      childIndex,
      parentElement,
      manager,
      renderNew,
      parentFragment
    )
  } else if (childIndex in manager.fragmentChildren) {
    render()
  } else {
    renderNew()
  }
}

function replaceElementForFragment(
  existingChild: CreatedNodeChild,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  renderFragment: () => void,
  parentFragment?: CreatedFragmentChild
) {
  parentElement.removeChild(existingChild.element)
  unsubscribe(existingChild)
  removeCreatedChild(manager, existingChild.index, parentFragment)

  return renderFragment()
}
