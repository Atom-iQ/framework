import type {
  CreatedChildrenManager,
  FragmentRenderCallback,
  RenderNewChildCallbackFn,
  RvdChild,
  RvdFragmentElement,
  RxSub
} from '../../../shared/types'
import { removeChildFromIndexPosition } from '../dom-renderer'
import { childrenArrayToFragment, renderTypeSwitch, unsubscribe } from '../utils'
import { renderRvdFragment } from '../fragment'

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
    childIndex,
    element,
    existingChild.element
  )
}

export const fragmentRenderCallback: FragmentRenderCallback = (
  childIndex,
  parentElement,
  createdChildren,
  childrenSubscription,
  renderNewCallback: RenderNewChildCallbackFn
) => (child: RvdFragmentElement): void => {
  const render = () =>
    renderRvdFragment(
      childIndex,
      parentElement,
      createdChildren,
      childrenSubscription,
      renderNewCallback
    )(child)

  const renderNew = () => {
    createdChildren.createEmptyFragment(childIndex)
    render()
  }

  renderTypeSwitch(
    replaceElementForFragment(childIndex, parentElement, createdChildren, renderNew),
    render,
    renderNew
  )(childIndex, createdChildren)
}

export const staticFragmentRenderCallback: FragmentRenderCallback = (
  childIndex,
  element,
  createdChildren,
  childrenSubscription,
  renderNewCallback: RenderNewChildCallbackFn
) => (child: RvdFragmentElement): void => {
  createdChildren.createEmptyFragment(childIndex)
  renderRvdFragment(
    childIndex,
    element,
    createdChildren,
    childrenSubscription,
    renderNewCallback
  )(child)
}

export const arrayRenderCallback: FragmentRenderCallback = (
  ...args: [string, Element, CreatedChildrenManager, RxSub, RenderNewChildCallbackFn]
) => (child: RvdChild[]): void => fragmentRenderCallback(...args)(childrenArrayToFragment(child))

export const staticArrayRenderCallback: FragmentRenderCallback = (
  ...args: [string, Element, CreatedChildrenManager, RxSub, RenderNewChildCallbackFn]
) => (child: RvdChild[]): void =>
  staticFragmentRenderCallback(...args)(childrenArrayToFragment(child))
