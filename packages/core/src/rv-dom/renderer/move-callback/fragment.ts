import {
  removeChildFromIndexPosition,
  renderChildInIndexPosition
} from '../dom-renderer'
import { renderTypeSwitch, unsubscribe } from '../utils'
import {
  CreatedChildrenManager,
  CreatedFragmentChild,
  Dictionary,
  KeyedChild,
  RvdElement
} from '../../../shared/types'
import { removeExistingFragment } from './utils'

const render = (
  child: RvdElement,
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
) => () => {
  const childIndexPartsLength = childIndex.split('.').length

  currentKeyedElement.fragmentChildren.forEach(fragmentChild => {
    const fragmentChildIndexRest = fragmentChild.index
      .split('.')
      .slice(childIndexPartsLength)
      .join('.')

    const fragmentChildIndex = `${childIndex}.${fragmentChildIndexRest}`

    renderChildInIndexPosition(
      newChild => {
        createdChildren.add(fragmentChildIndex, {
          ...newChild,
          key: fragmentChild.key,
          subscription: fragmentChild.subscription
        })

        if (createdChildren.has(fragmentChild.index)) {
          createdChildren.remove(fragmentChild.index)
        }
      },
      fragmentChild.element,
      fragmentChildIndex,
      element,
      createdChildren
    )
  })

  createdFragment.fragmentChildKeys = {
    ...createdFragment.fragmentChildKeys,
    [child.key]: childIndex
  }
  delete oldKeyElementMap[child.key]
}

export const nestedFragmentMoveCallback = (
  child: RvdElement,
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
): void => {
  return renderTypeSwitch(
    () => {
      removeChildFromIndexPosition(
        removedChild => {
          createdChildren.remove(removedChild.index)
          if (!removedChild.key || !oldKeyElementMap[removedChild.key]) {
            unsubscribe(removedChild)
          }
        },
        childIndex,
        element,
        createdChildren
      )
      render(
        child,
        currentKeyedElement,
        oldKeyElementMap,
        createdFragment,
        childIndex,
        element,
        createdChildren
      )()
    },
    existingFragment => {
      removeExistingFragment(
        oldKeyElementMap,
        childIndex,
        element,
        createdChildren
      )(existingFragment)

      render(
        child,
        currentKeyedElement,
        oldKeyElementMap,
        createdFragment,
        childIndex,
        element,
        createdChildren
      )()
    },
    render(
      child,
      currentKeyedElement,
      oldKeyElementMap,
      createdFragment,
      childIndex,
      element,
      createdChildren
    )
  )(childIndex, createdChildren)
}
