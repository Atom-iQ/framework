import type {
  CreatedChildrenManager,
  CreatedFragmentChild,
  Dictionary,
  KeyedChild
} from '../../../shared/types'
import { renderChildInIndexPosition, removeExistingFragment } from '../dom-renderer'
import { removeChild, renderTypeSwitch, unsubscribe } from '../utils'
import { updateKeyedChild } from './utils'
import { removeCreatedChild, setCreatedChild, setCreatedFragment } from '../utils/children-manager'
import { arrayLoop } from '../../../shared'

const moveFragment = (
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  manager: CreatedChildrenManager
) => {
  const key: string | number = currentKeyedElement.child.key
  const childIndexPartsLength = childIndex.split('.').length

  arrayLoop(currentKeyedElement.fragmentChildren, fragmentChild => {
    const fragmentChildIndexRest = fragmentChild.index
      .split('.')
      .slice(childIndexPartsLength)
      .join('.')

    renderChildInIndexPosition(
      newChild => {
        setCreatedChild(manager, newChild.index, {
          ...newChild,
          key: fragmentChild.key,
          subscription: fragmentChild.subscription,
          type: fragmentChild.type,
          isText: fragmentChild.isText
        })

        if (manager.children[fragmentChild.index]) {
          removeCreatedChild(manager, fragmentChild.index)
        }
      },
      fragmentChild.element,
      `${childIndex}.${fragmentChildIndexRest}`,
      element,
      manager
    )
  })

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
  manager: CreatedChildrenManager
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

  return renderTypeSwitch(
    existingChild => {
      removeChild(parentElement, existingChild.element)
      if (!existingChild.key || !oldKeyElementMap[existingChild.key]) {
        unsubscribe(existingChild)
      }
      removeCreatedChild(manager, existingChild.index)
      move()
    },
    existingFragment => {
      removeExistingFragment(oldKeyElementMap, childIndex, parentElement, manager)(existingFragment)
      move()
    },
    move
  )(childIndex, manager)
}
