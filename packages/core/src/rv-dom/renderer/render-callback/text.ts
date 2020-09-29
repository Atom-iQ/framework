import { createTextNode, renderTypeSwitch, unsubscribe } from '../utils'
import {
  removeChildFromIndexPosition,
  renderChildInIndexPosition,
  replaceChildOnIndexPosition
} from '../dom-renderer'
import { RenderCallback } from '../../../shared/types'
import { getSortedFragmentChildIndexes } from '../utils/children-manager'

export const textRenderCallback: RenderCallback = (
  childIndex,
  element,
  createdChildren
) => (child: string | number): void => {
  const renderTextCallback = () => {
    renderChildInIndexPosition(
      newChild => createdChildren.add(childIndex, newChild),
      createTextNode(String(child)),
      childIndex,
      element,
      createdChildren
    )
  }

  renderTypeSwitch(
    existingChild => {
      replaceChildOnIndexPosition(
        newChild => {
          unsubscribe(existingChild)
          createdChildren.replace(childIndex, newChild)
        },
        createTextNode(String(child)),
        childIndex,
        element,
        createdChildren
      )
    },
    existingFragment => {
      getSortedFragmentChildIndexes(existingFragment).forEach(fragmentChildIndex => {
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
      renderTextCallback()
    },
    renderTextCallback
  )(childIndex, createdChildren)
}

export const staticTextRenderCallback: RenderCallback = (
  childIndex,
  element,
  createdChildren
) => (child: string | number): void => {
  renderChildInIndexPosition(
    newChild => createdChildren.add(childIndex, newChild),
    createTextNode(String(child)),
    childIndex,
    element,
    createdChildren
  )
}

