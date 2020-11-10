import type {
  CreatedFragmentChild,
  CreatedNodeChild,
  RvdChildrenManager,
  RvdContext
} from '../../../shared/types'
import { createTextNode, renderTypeSwitch, replaceChild, unsubscribe } from '../utils'
import { renderChildInIndexPosition, removeExistingFragment } from '../dom-renderer'
import { applyMiddlewares } from '../../../middlewares/middlewares-manager'
import { setCreatedChild } from '../children-manager'
import { Subscription } from 'rxjs'

export function textRenderCallback(
  child: string | number,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  childrenSubscription: Subscription,
  _context?: RvdContext,
  isStatic = false,
  parentFragment?: CreatedFragmentChild
): void {
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
    renderChildInIndexPosition(textNode, childIndex, parentElement, manager, parentFragment)
    setCreatedChild(manager, childIndex, createdTextChild(childIndex, textNode), parentFragment)
  }

  if (
    isStatic ||
    manager.isInAppendMode ||
    (parentFragment && parentFragment.isInFragmentAppendMode)
  ) {
    renderTextCallback()
  } else {
    renderTypeSwitch(
      childIndex,
      manager,
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
        removeExistingFragment(
          null,
          childIndex,
          parentElement,
          manager,
          parentFragment
        )(existingFragment)
        renderTextCallback()
      },
      renderTextCallback
    )
  }
}

function createdTextChild(index: string, element: Text): CreatedNodeChild {
  return { element, index, isText: true }
}
