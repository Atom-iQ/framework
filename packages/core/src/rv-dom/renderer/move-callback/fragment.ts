import type {
  CreatedChildrenManager,
  CreatedFragmentChild,
  Dictionary,
  KeyedChild
} from '../../../shared/types'
import {
  removeChildFromIndexPosition,
  renderChildInIndexPosition,
  removeExistingFragment
} from '../dom-renderer'
import { renderTypeSwitch, unsubscribe } from '../utils'
import { updateKeyedChild } from './utils'

const moveFragment = (
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
) => {
  const key: string | number = currentKeyedElement.child.key
  const childIndexPartsLength = childIndex.split('.').length

  currentKeyedElement.fragmentChildren.forEach(fragmentChild => {
    const fragmentChildIndexRest = fragmentChild.index
      .split('.')
      .slice(childIndexPartsLength)
      .join('.')

    renderChildInIndexPosition(
      newChild => {
        createdChildren.add(newChild.index, {
          ...newChild,
          key: fragmentChild.key,
          subscription: fragmentChild.subscription,
          type: fragmentChild.type,
          isText: fragmentChild.isText
        })

        if (createdChildren.has(fragmentChild.index)) {
          createdChildren.remove(fragmentChild.index)
        }
      },
      fragmentChild.element,
      `${childIndex}.${fragmentChildIndexRest}`,
      element,
      createdChildren
    )
  })

  updateKeyedChild(
    currentKeyedElement,
    oldKeyElementMap,
    createdFragment,
    childIndex,
    createdChildren,
    'getFragment',
    'removeFragment'
  )

  createdChildren.addFragment(childIndex, {
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
  element: Element,
  createdChildren: CreatedChildrenManager
): void => {
  const move = () =>
    moveFragment(
      currentKeyedElement,
      oldKeyElementMap,
      createdFragment,
      childIndex,
      element,
      createdChildren
    )

  return renderTypeSwitch(
    existingChild => {
      removeChildFromIndexPosition(
        () => {
          if (!existingChild.key || !oldKeyElementMap[existingChild.key]) {
            unsubscribe(existingChild)
          }

          createdChildren.remove(existingChild.index)
        },
        element,
        existingChild.element
      )
      move()
    },
    existingFragment => {
      removeExistingFragment(
        oldKeyElementMap,
        childIndex,
        element,
        createdChildren
      )(existingFragment)

      move()
    },
    move
  )(childIndex, createdChildren)
}
