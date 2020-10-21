import type {
  CreatedChildrenManager,
  CreatedFragmentChild,
  CreatedNodeChild,
  RvdConnectedNode,
  RvdDOMElement
} from '../../../shared/types'
import {
  renderChildInIndexPosition,
  replaceChildOnIndexPosition,
  removeExistingFragment
} from '../dom-renderer'
import { unsubscribe } from '../utils'
import { Subscription } from 'rxjs'

export const replaceElementForElement = (
  elementNode: RvdConnectedNode,
  childIndex: string,
  parentElement: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: Subscription,
  rvdElement: RvdDOMElement
) => (existingChild: CreatedNodeChild): void => {
  const childElementSubscription = elementNode.elementSubscription
  if (childElementSubscription) {
    childrenSubscription.add(childElementSubscription)
  }

  replaceChildOnIndexPosition(
    newChild => {
      unsubscribe(existingChild)
      createdChildren.replace(childIndex, {
        ...newChild,
        subscription: childElementSubscription,
        type: rvdElement.type,
        key: rvdElement.key
      })
    },
    elementNode.element,
    parentElement,
    existingChild
  )
}

export const replaceFragmentForElement = (
  renderFn: () => void,
  childIndex: string,
  parentElement: Element,
  createdChildren: CreatedChildrenManager
) => (existingFragment: CreatedFragmentChild): void => {
  removeExistingFragment(null, childIndex, parentElement, createdChildren)(existingFragment)
  renderFn()
}

export const renderElement = (
  elementNode: RvdConnectedNode,
  childIndex: string,
  parentElement: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: Subscription,
  rvdElement: RvdDOMElement
) => (): void => {
  const childElementSubscription = elementNode.elementSubscription
  if (childElementSubscription) {
    childrenSubscription.add(childElementSubscription)
  }

  renderChildInIndexPosition(
    newChild =>
      createdChildren.add(childIndex, {
        ...newChild,
        subscription: childElementSubscription,
        type: rvdElement.type,
        key: rvdElement.key
      }),
    elementNode.element,
    childIndex,
    parentElement,
    createdChildren
  )
}
