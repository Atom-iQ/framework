import type { CreatedNodeChild, RenderCallbackFactory } from '../../../shared/types'
import { createTextNode, renderTypeSwitch, replaceChild, unsubscribe } from '../utils'
import { renderChildInIndexPosition, removeExistingFragment } from '../dom-renderer'
import { applyMiddlewares } from '../../../middlewares/middlewares-manager'
import { setCreatedChild } from '../utils/children-manager'

export const textRenderCallback: RenderCallbackFactory = (
  childIndex,
  parentElement,
  manager,
  childrenSubscription,
  _context,
  isStatic = false,
  createdFragment
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
    const textNode = createTextNode(child)
    renderChildInIndexPosition(textNode, childIndex, parentElement, manager, createdFragment)
    setCreatedChild(manager, childIndex, createdTextChild(childIndex, textNode))
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
          setCreatedChild(manager, childIndex, createdTextChild(childIndex, textNode))
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

function createdTextChild(index: string, element: Text): CreatedNodeChild {
  return { element, index, isText: true }
}
