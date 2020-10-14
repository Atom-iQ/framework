import type { RenderCallback } from '../../../shared/types'
import { createTextNode, renderTypeSwitch, unsubscribe } from '../utils'
import {
  renderChildInIndexPosition,
  replaceChildOnIndexPosition,
  removeExistingFragment
} from '../dom-renderer'

const toTextChild = newChild => ({ ...newChild, isText: true })

export const textRenderCallback: RenderCallback = (childIndex, element, createdChildren) => (
  child: string | number
): void => {
  const renderTextCallback = () => {
    renderChildInIndexPosition(
      newChild => createdChildren.add(childIndex, toTextChild(newChild)),
      createTextNode(child),
      childIndex,
      element,
      createdChildren
    )
  }

  renderTypeSwitch(
    existingChild => {
      if (existingChild.isText) {
        existingChild.element.nodeValue = child + ''
      } else {
        replaceChildOnIndexPosition(
          newChild => {
            unsubscribe(existingChild)
            createdChildren.replace(childIndex, toTextChild(newChild))
          },
          createTextNode(child),
          element,
          existingChild
        )
      }
    },
    existingFragment => {
      removeExistingFragment(null, childIndex, element, createdChildren)(existingFragment)
      renderTextCallback()
    },
    renderTextCallback
  )(childIndex, createdChildren)
}

export const staticTextRenderCallback: RenderCallback = (childIndex, element, createdChildren) => (
  child: string | number
): void => {
  renderChildInIndexPosition(
    newChild => createdChildren.add(childIndex, toTextChild(newChild)),
    createTextNode(child),
    childIndex,
    element,
    createdChildren
  )
}
