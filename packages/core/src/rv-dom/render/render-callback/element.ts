import {
  CreatedChildrenManager,
  CreatedFragmentChild,
  CreatedNodeChild,
  RvdNode,
  RxSub
} from '@@types'
import {
  removeChildFromIndexPosition,
  renderChildInIndexPosition,
  replaceChildOnIndexPosition
} from '../dom-renderer'
import { getFlattenFragmentChildren, unsubscribe } from '../utils'

export const replaceElementForElement = (
  elementNode: RvdNode,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub
) => (existingChild: CreatedNodeChild) => {
  const childElementSubscription = elementNode.elementSubscription
  if (childElementSubscription) {
    childrenSubscription.add(childElementSubscription)
  }

  replaceChildOnIndexPosition(
    newChild => {
      unsubscribe(existingChild)
      createdChildren.add(childIndex, {
        ...newChild,
        subscription: childElementSubscription
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
  elementNode: RvdNode,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
) => (existingFragment: CreatedFragmentChild) => {
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
  elementNode: RvdNode,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub
) => () => {
  const childElementSubscription = elementNode.elementSubscription
  if (childElementSubscription) {
    childrenSubscription.add(childElementSubscription)
  }

  renderChildInIndexPosition(
    newChild => createdChildren.add(childIndex, {
      ...newChild,
      subscription: childElementSubscription
    }),
    elementNode.dom,
    childIndex,
    element,
    createdChildren
  )
}
