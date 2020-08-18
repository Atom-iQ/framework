import { renderTypeSwitch, unsubscribe } from '../utils'
import {
  renderChildInIndexPosition,
  replaceChildOnIndexPosition
} from '../dom-renderer'
import {
  CreatedChildrenManager,
  CreatedFragmentChild,
  Dictionary,
  KeyedChild,
  RvdElement
} from '@@types'
import { removeExistingFragment } from './utils'

const render = (
  child: RvdElement,
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
) => {
  renderChildInIndexPosition(
    newChild => {
      createdChildren.add(childIndex, {
        ...newChild,
        key: child.key,
        subscription: currentKeyedElement.child.subscription
      })

      createdFragment.fragmentChildKeys = {
        ...createdFragment.fragmentChildKeys,
        [child.key]: childIndex
      }
      delete oldKeyElementMap[child.key]
    },
    (currentKeyedElement.child.element as Element | Text),
    childIndex,
    element,
    createdChildren
  )
}

export const elementMoveCallback = (
  child: RvdElement,
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
) => {
  return renderTypeSwitch(
    existingChild => {
      replaceChildOnIndexPosition(
        newChild => {
          if (!existingChild.key || !oldKeyElementMap[existingChild.key]) {
            unsubscribe(existingChild)
          }

          createdChildren.replace(childIndex, {
            ...newChild,
            key: child.key,
            subscription: currentKeyedElement.child.subscription
          })
          createdFragment.fragmentChildKeys = {
            ...createdFragment.fragmentChildKeys,
            [child.key]: childIndex
          }
          delete oldKeyElementMap[child.key]
        },
        (currentKeyedElement.child.element as Element | Text),
        childIndex,
        element,
        createdChildren
      )
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
      )
    },
    () => render(
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
