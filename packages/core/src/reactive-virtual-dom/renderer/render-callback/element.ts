import type {
  RvdChildrenManager,
  CreatedFragmentChild,
  CreatedNodeChild,
  RvdElementNode
} from '../../../shared/types'
import { renderChildInIndexPosition } from '../dom-renderer'
import { unsubscribe } from '../utils'
import { Subscription } from 'rxjs'
import { setCreatedChild } from '../children-manager'

export function replaceElementForElement(
  existingChild: CreatedNodeChild,
  childElement: Element,
  childElementSubscription: Subscription,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  childrenSubscription: Subscription,
  rvdElement: RvdElementNode
): void {
  if (childElementSubscription) {
    childrenSubscription.add(childElementSubscription)
  }

  parentElement.replaceChild(childElement, existingChild.element)

  unsubscribe(existingChild)
  setCreatedChild(manager, childIndex, {
    index: existingChild.index,
    element: childElement,
    subscription: childElementSubscription,
    type: rvdElement.type,
    key: rvdElement.key
  })
}

export function renderElement(
  childElement: Element,
  childElementSubscription: Subscription,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  childrenSubscription: Subscription,
  rvdElement: RvdElementNode,
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
