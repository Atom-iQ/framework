import type {
  CreatedChildrenManager,
  CreatedFragmentChild,
  CreatedNodeChild,
  RvdConnectedNode,
  RxSub
} from '../../../shared/types'
import {
  removeChildFromIndexPosition,
  renderChildInIndexPosition,
  replaceChildOnIndexPosition
} from '../dom-renderer'
import { getFlattenFragmentChildren, unsubscribe } from '../utils'

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
    childIndex,
    element,
    createdChildren
  )
}

export const replaceFragmentForElement = (
  renderFn: () => void,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
) => (existingFragment: CreatedFragmentChild): void => {
  existingFragment.fragmentChildIndexes
    .reduce(getFlattenFragmentChildren(createdChildren, true), [])
    .forEach((fragmentChildIndex: string) => {
      removeChildFromIndexPosition(
        removedChild => {
          unsubscribe(removedChild)
          createdChildren.remove(fragmentChildIndex)
        },
        fragmentChildIndex,
        element,
        createdChildren
      )
    })

  unsubscribe(existingFragment)
  createdChildren.removeFragment(childIndex)
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
