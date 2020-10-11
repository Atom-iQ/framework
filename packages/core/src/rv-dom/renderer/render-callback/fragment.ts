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
  child: RvdFragmentElement,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub,
  renderNewCallback: RenderNewChildCallbackFn
) => () => {
  removeChildFromIndexPosition(
    removedChild => {
      unsubscribe(removedChild)
      createdChildren.remove(removedChild.index)

      createdChildren.createEmptyFragment(childIndex)
      return renderRvdFragment(
        childIndex,
        element,
        createdChildren,
        childrenSubscription,
        renderNewCallback
      )(child)
    },
    childIndex,
    element,
    createdChildren
  )
}

const replaceFragmentForFragment = (
  child: RvdFragmentElement,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub,
  renderNewCallback: RenderNewChildCallbackFn
) => () => {
  return renderRvdFragment(
    childIndex,
    element,
    createdChildren,
    childrenSubscription,
    renderNewCallback
  )(child)
}

const renderFragment = (
  child: RvdFragmentElement,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub,
  renderNewCallback: RenderNewChildCallbackFn
) => () => {
  createdChildren.createEmptyFragment(childIndex)
  return renderRvdFragment(
    childIndex,
    element,
    createdChildren,
    childrenSubscription,
    renderNewCallback
  )(child)
}

export const fragmentRenderCallback: FragmentRenderCallback = (
  childIndex,
  element,
  createdChildren,
  childrenSubscription,
  renderNewCallback: RenderNewChildCallbackFn
) => (child: RvdFragmentElement): void => {
  renderTypeSwitch(
    replaceElementForFragment(
      child,
      childIndex,
      element,
      createdChildren,
      childrenSubscription,
      renderNewCallback
    ),
    replaceFragmentForFragment(
      child,
      childIndex,
      element,
      createdChildren,
      childrenSubscription,
      renderNewCallback
    ),
    renderFragment(
      child,
      childIndex,
      element,
      createdChildren,
      childrenSubscription,
      renderNewCallback
    )
  )(childIndex, createdChildren)
}

export const staticFragmentRenderCallback: FragmentRenderCallback = (
  childIndex,
  element,
  createdChildren,
  childrenSubscription,
  renderNewCallback: RenderNewChildCallbackFn
) => (child: RvdFragmentElement): void => {
  renderFragment(
    child,
    childIndex,
    element,
    createdChildren,
    childrenSubscription,
    renderNewCallback
  )()
}

export const arrayRenderCallback: FragmentRenderCallback = (
  ...args: [string, Element, CreatedChildrenManager, RxSub, RenderNewChildCallbackFn]
) => (child: RvdChild[]): void => fragmentRenderCallback(...args)(childrenArrayToFragment(child))

export const staticArrayRenderCallback: FragmentRenderCallback = (
  ...args: [string, Element, CreatedChildrenManager, RxSub, RenderNewChildCallbackFn]
) => (child: RvdChild[]): void =>
  staticFragmentRenderCallback(...args)(childrenArrayToFragment(child))
