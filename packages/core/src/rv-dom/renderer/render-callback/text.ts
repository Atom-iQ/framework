import type { RenderCallback } from '../../../shared/types'
import { createTextNode, renderTypeSwitch, unsubscribe } from '../utils'
import {
  renderChildInIndexPosition,
  replaceChildOnIndexPosition,
  removeExistingFragment
} from '../dom-renderer'
import { applyMiddlewares } from '../../../middlewares/middlewares-manager'

const toTextChild = newChild => ({ ...newChild, isText: true })

export const textRenderCallback: RenderCallback = (
  childIndex,
  parentElement,
  createdChildren,
  childrenSubscription,
  _context,
  isStatic = false
) => (child: string | number): void => {
  // Middleware: text pre-render - (child, parentElement, createdChildren, childIndex) => child
  child = applyMiddlewares(
    'textPreRender',
    child,
    parentElement,
    createdChildren,
    childIndex,
    childrenSubscription
  )

  const renderTextCallback = () => {
    renderChildInIndexPosition(
      newChild => createdChildren.add(childIndex, toTextChild(newChild)),
      createTextNode(child),
      childIndex,
      parentElement,
      createdChildren
    )
  }

  if (isStatic) {
    renderTextCallback()
  } else {
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
            parentElement,
            existingChild
          )
        }
      },
      existingFragment => {
        removeExistingFragment(null, childIndex, parentElement, createdChildren)(existingFragment)
        renderTextCallback()
      },
      renderTextCallback
    )(childIndex, createdChildren)
  }
}
