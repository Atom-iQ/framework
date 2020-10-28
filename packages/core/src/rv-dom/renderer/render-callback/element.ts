import type {
  CreatedChildrenManager,
  CreatedFragmentChild,
  CreatedNodeChild,
  RvdConnectedNode,
  RvdDOMElement
} from '../../../shared/types'
import { renderChildInIndexPosition, removeExistingFragment } from '../dom-renderer'
import { replaceChild, unsubscribe } from '../utils'
import { Subscription } from 'rxjs'
import { setCreatedChild } from '../utils/children-manager'

export const replaceElementForElement = (
  elementNode: RvdConnectedNode,
  childIndex: string,
  parentElement: Element,
  manager: CreatedChildrenManager,
  childrenSubscription: Subscription,
  rvdElement: RvdDOMElement
) => (existingChild: CreatedNodeChild): void => {
  const childElementSubscription = elementNode.elementSubscription
  if (childElementSubscription) {
    childrenSubscription.add(childElementSubscription)
  }

  replaceChild(parentElement, elementNode.element, existingChild.element)

  unsubscribe(existingChild)
  setCreatedChild(manager, childIndex, {
    index: existingChild.index,
    element: elementNode.element,
    subscription: childElementSubscription,
    type: rvdElement.type,
    key: rvdElement.key
  })
}

export const replaceFragmentForElement = (
  renderFn: () => void,
  childIndex: string,
  parentElement: Element,
  manager: CreatedChildrenManager
) => (existingFragment: CreatedFragmentChild): void => {
  removeExistingFragment(null, childIndex, parentElement, manager)(existingFragment)
  renderFn()
}

export const renderElement = (
  elementNode: RvdConnectedNode,
  childIndex: string,
  parentElement: Element,
  manager: CreatedChildrenManager,
  childrenSubscription: Subscription,
  rvdElement: RvdDOMElement
) => (): void => {
  const childElementSubscription = elementNode.elementSubscription
  if (childElementSubscription) {
    childrenSubscription.add(childElementSubscription)
  }

  renderChildInIndexPosition(
    newChild =>
      setCreatedChild(manager, childIndex, {
        ...newChild,
        subscription: childElementSubscription,
        type: rvdElement.type,
        key: rvdElement.key
      }),
    elementNode.element,
    childIndex,
    parentElement,
    manager
  )
}
