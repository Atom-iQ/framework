import type {
  RvdChildrenManager,
  CreatedFragmentChild,
  Dictionary,
  KeyedChild
} from '../../../shared/types'
import { renderChildInIndexPosition, removeExistingFragment } from '../dom-renderer'
import { unsubscribe } from '../utils'
import { updateKeyedChild } from './utils'
import { removeCreatedChild, setCreatedChild, setCreatedFragment } from '../children-manager'

const moveFragment = (
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  manager: RvdChildrenManager
) => {
  const key: string | number = currentKeyedElement.child.key
  const childIndexPartsLength = childIndex.split('.').length

  for (let i = 0, l = currentKeyedElement.fragmentChildren.length; i < l; ++i) {
    const fragmentChild = currentKeyedElement.fragmentChildren[i]
    const fragmentChildIndexRest = fragmentChild.index
      .split('.')
      .slice(childIndexPartsLength)
      .join('.')

    const newChildIndex = `${childIndex}.${fragmentChildIndexRest}`

    renderChildInIndexPosition(fragmentChild.element, newChildIndex, element, manager)
    setCreatedChild(manager, newChildIndex, {
      index: newChildIndex,
      element: fragmentChild.element,
      key: fragmentChild.key,
      subscription: fragmentChild.subscription,
      type: fragmentChild.type,
      isText: fragmentChild.isText
    })

    if (manager.children[fragmentChild.index]) {
      removeCreatedChild(manager, fragmentChild.index)
    }
  }

  updateKeyedChild(
    currentKeyedElement,
    oldKeyElementMap,
    createdFragment,
    childIndex,
    manager,
    true
  )

  setCreatedFragment(manager, childIndex, {
    ...(currentKeyedElement.child as CreatedFragmentChild),
    index: childIndex,
    key
  })
}

export const fragmentMoveCallback = (
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager
): void => {
  const move = () =>
    moveFragment(
      currentKeyedElement,
      oldKeyElementMap,
      createdFragment,
      childIndex,
      parentElement,
      manager
    )

  if (childIndex in manager.children) {
    const existingChild = manager.children[childIndex]
    parentElement.removeChild(existingChild.element)
    if (!existingChild.key || !oldKeyElementMap[existingChild.key]) {
      unsubscribe(existingChild)
    }
    removeCreatedChild(manager, existingChild.index)
    move()
  } else if (childIndex in manager.fragmentChildren) {
    removeExistingFragment(
      manager.fragmentChildren[childIndex],
      oldKeyElementMap,
      childIndex,
      parentElement,
      manager
    )
    move()
  } else {
    move()
  }
}
