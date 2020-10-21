import type {
  CreatedChildrenManager,
  FragmentRenderCallback,
  RenderNewChildCallbackFn,
  RvdChild,
  RvdContext,
  RvdFragmentElement
} from '../../../shared/types'
import { removeChildFromIndexPosition } from '../dom-renderer'
import { childrenArrayToFragment, renderTypeSwitch, unsubscribe } from '../utils'
import { renderRvdFragment } from '../fragment'
import { Subscription } from 'rxjs'

const replaceElementForFragment = (
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  renderFragment: () => void
) => existingChild => {
  removeChildFromIndexPosition(
    () => {
      unsubscribe(existingChild)
      createdChildren.remove(existingChild.index)

      return renderFragment()
    },
    element,
    existingChild.element
  )
}

export const fragmentRenderCallback: FragmentRenderCallback = (
  childIndex,
  parentElement,
  createdChildren,
  childrenSubscription,
  context,
  isStatic,
  renderNewCallback
) => (child: RvdFragmentElement): void => {
  const render = () =>
    renderRvdFragment(
      childIndex,
      parentElement,
      createdChildren,
      childrenSubscription,
      context,
      renderNewCallback
    )(child)

  const renderNew = () => {
    createdChildren.createEmptyFragment(childIndex)
    render()
  }

  if (isStatic) {
    renderNew()
  } else {
    renderTypeSwitch(
      replaceElementForFragment(childIndex, parentElement, createdChildren, renderNew),
      render,
      renderNew
    )(childIndex, createdChildren)
  }
}

export const arrayRenderCallback: FragmentRenderCallback = (
  ...args: [
    string,
    Element,
    CreatedChildrenManager,
    Subscription,
    RvdContext,
    boolean,
    RenderNewChildCallbackFn
  ]
) => (child: RvdChild[]): void => fragmentRenderCallback(...args)(childrenArrayToFragment(child))
