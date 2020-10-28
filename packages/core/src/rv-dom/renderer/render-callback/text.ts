import type { RenderCallback } from '../../../shared/types'
import { createTextNode, renderTypeSwitch, replaceChild, unsubscribe } from '../utils'
import { renderChildInIndexPosition, removeExistingFragment } from '../dom-renderer'
import { applyMiddlewares } from '../../../middlewares/middlewares-manager'
import { setCreatedChild } from '../utils/children-manager'

const toTextChild = newChild => ({ ...newChild, isText: true })

export const textRenderCallback: RenderCallback = (
  childIndex,
  parentElement,
  manager,
  childrenSubscription,
  _context,
  isStatic = false
) => (child: string | number): void => {
  // Middleware: text pre-render - (child, parentElement, createdChildren, childIndex) => child
  child = applyMiddlewares(
    'textPreRender',
    child,
    parentElement,
    manager,
    childIndex,
    childrenSubscription
  )

  const renderTextCallback = () => {
    renderChildInIndexPosition(
      newChild => setCreatedChild(manager, childIndex, toTextChild(newChild)),
      createTextNode(child),
      childIndex,
      parentElement,
      manager
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
          const textNode = createTextNode(child)
          replaceChild(parentElement, textNode, existingChild.element)
          unsubscribe(existingChild)
          setCreatedChild(manager, childIndex, {
            index: childIndex,
            element: textNode,
            isText: true
          })
        }
      },
      existingFragment => {
        removeExistingFragment(null, childIndex, parentElement, manager)(existingFragment)
        renderTextCallback()
      },
      renderTextCallback
    )(childIndex, manager)
  }
}
