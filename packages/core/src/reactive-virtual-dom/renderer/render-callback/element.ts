import type {
  RvdChildrenManager,
  CreatedFragmentChild,
  CreatedNodeChild,
  RvdDOMElement
} from '../../../shared/types'
import { renderChildInIndexPosition, removeExistingFragment } from '../dom-renderer'
import { replaceChild, unsubscribe } from '../utils'
import { Subscription } from 'rxjs'
import { setCreatedChild } from '../children-manager'

export function replaceElementForElement(
  childElement: Element,
  childElementSubscription: Subscription,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  childrenSubscription: Subscription,
  rvdElement: RvdDOMElement
): (existingChild: CreatedNodeChild) => void {
  return function render(existingChild: CreatedNodeChild): void {
    if (childElementSubscription) {
      childrenSubscription.add(childElementSubscription)
    }

    replaceChild(parentElement, childElement, existingChild.element)

    unsubscribe(existingChild)
    setCreatedChild(manager, childIndex, {
      index: existingChild.index,
      element: childElement,
      subscription: childElementSubscription,
      type: rvdElement.type,
      key: rvdElement.key
    })
  }
}

export function replaceFragmentForElement(
  renderFn: () => void,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  parentFragment?: CreatedFragmentChild
): (existingFragment: CreatedFragmentChild) => void {
  return function render(existingFragment: CreatedFragmentChild): void {
    removeExistingFragment(
      null,
      childIndex,
      parentElement,
      manager,
      parentFragment
    )(existingFragment)
    renderFn()
  }
}

export function renderElement(
  childElement: Element,
  childElementSubscription: Subscription,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  childrenSubscription: Subscription,
  rvdElement: RvdDOMElement,
  createdFragment?: CreatedFragmentChild
): () => void {
  return function render(): void {
    if (childElementSubscription) {
      childrenSubscription.add(childElementSubscription)
    }

    renderChildInIndexPosition(childElement, childIndex, parentElement, manager, createdFragment)

    setCreatedChild(
      manager,
      childIndex,
      {
        index: childIndex,
        element: childElement,
        subscription: childElementSubscription,
        type: rvdElement.type,
        key: rvdElement.key
      },
      createdFragment
    )
  }
}
