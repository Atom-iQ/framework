import type {
  CreatedChildrenManager,
  CreatedFragmentChild,
  CreatedNodeChild,
  RvdConnectedNode,
  RxSub
} from '../../../shared/types'
import { renderChildInIndexPosition, replaceChildOnIndexPosition } from '../dom-renderer'
import { removeExistingFragment, unsubscribe } from '../utils'

export const replaceElementForElement = (
  elementNode: RvdConnectedNode,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub,
  isOption?: boolean,
  key?: string | number | null
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
        key,
        isOption
      })
    },
    elementNode.dom,
    element,
    existingChild
  )
}

export const replaceFragmentForElement = (
  renderFn: () => void,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
) => (existingFragment: CreatedFragmentChild): void => {
  removeExistingFragment(null, childIndex, element, createdChildren)(existingFragment)
  renderFn()
}

export const renderElement = (
  elementNode: RvdConnectedNode,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub,
  isOption?: boolean,
  key?: string | number | null
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
        key,
        isOption
      }),
    elementNode.dom,
    childIndex,
    element,
    createdChildren
  )
}
