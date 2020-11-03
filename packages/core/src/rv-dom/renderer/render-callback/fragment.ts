import type {
  RvdChildrenManager,
  FragmentRenderCallback,
  RenderNewChildCallbackFn,
  RvdChild,
  RvdContext,
  RvdFragmentElement
} from '../../../shared/types'
import { childrenArrayToFragment, removeChild, renderTypeSwitch, unsubscribe } from '../utils'
import { renderRvdFragment } from '../fragment'
import { Subscription } from 'rxjs'
import { createEmptyFragment, removeCreatedChild } from '../utils/children-manager'

const replaceElementForFragment = (
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  renderFragment: () => void
) => existingChild => {
  removeChild(parentElement, existingChild.element)
  unsubscribe(existingChild)
  removeCreatedChild(manager, existingChild.index)

  return renderFragment()
}

export const fragmentRenderCallback: FragmentRenderCallback = (
  childIndex,
  parentElement,
  manager,
  childrenSubscription,
  context,
  isStatic,
  renderNewCallback
) => (child: RvdFragmentElement): void => {
  const render = () =>
    renderRvdFragment(
      childIndex,
      parentElement,
      manager,
      childrenSubscription,
      context,
      renderNewCallback
    )(child)

  const renderNew = () => {
    createEmptyFragment(manager, childIndex)
    render()
  }

  if (isStatic) {
    renderNew()
  } else {
    renderTypeSwitch(
      replaceElementForFragment(childIndex, parentElement, manager, renderNew),
      render,
      renderNew
    )(childIndex, manager)
  }
}

export const arrayRenderCallback: FragmentRenderCallback = (
  ...args: [
    string,
    Element,
    RvdChildrenManager,
    Subscription,
    RvdContext,
    boolean,
    RenderNewChildCallbackFn
  ]
) => (child: RvdChild[]): void => fragmentRenderCallback(...args)(childrenArrayToFragment(child))
