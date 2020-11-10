import type {
  RvdChildrenManager,
  RenderNewChildCallbackFn,
  RvdContext,
  RvdFragmentElement,
  CreatedFragmentChild
} from '../../../shared/types'
import { removeChild, renderTypeSwitch, unsubscribe } from '../utils'
import { renderRvdFragment } from '../fragment'
import { Subscription } from 'rxjs'
import { createEmptyFragment, removeCreatedChild } from '../children-manager'

export function fragmentRenderCallback(
  child: RvdFragmentElement,
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
  } else {
    renderTypeSwitch(
      childIndex,
      manager,
      replaceElementForFragment(childIndex, parentElement, manager, renderNew, parentFragment),
      render,
      renderNew
    )
  }
}

function replaceElementForFragment(
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  renderFragment: () => void,
  parentFragment?: CreatedFragmentChild
) {
  return function replace(existingChild) {
    removeChild(parentElement, existingChild.element)
    unsubscribe(existingChild)
    removeCreatedChild(manager, existingChild.index, parentFragment)

    return renderFragment()
  }
}
