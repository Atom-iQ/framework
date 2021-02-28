import type {
  RvdCreatedFragment,
  RvdCreatedNode,
  RvdChildrenManager,
  RvdContext
} from '../../../shared/types'
import { createTextNode, unsubscribe } from '../utils'
import { renderChildInIndexPosition, removeExistingFragment } from '../dom-renderer'
import { applyMiddlewares } from '../../../middlewares/middlewares-manager'
import { Subscription } from 'rxjs'
import { setCreatedChild } from '../children-manager'

export function textRenderCallback(
  child: string | number,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  childrenSubscription: Subscription,
  _context?: RvdContext,
  isStatic = false,
  parentFragment?: RvdCreatedFragment
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

  const shouldAppend = isStatic || manager.append || (parentFragment && parentFragment.append)
  if (!shouldAppend && manager.children[childIndex]) {
    const existingChild = manager.children[childIndex]
    if (existingChild.isText) {
      existingChild.element.nodeValue = child + ''
    } else {
      const textNode = createTextNode(child)
      parentElement.replaceChild(textNode, existingChild.element)
      unsubscribe(existingChild)
      setCreatedChild(manager, childIndex, createdTextChild(childIndex, textNode))
    }
  } else {
    if (!shouldAppend && manager.fragmentChildren[childIndex]) {
      removeExistingFragment(
        manager.fragmentChildren[childIndex],
        childIndex,
        parentElement,
        manager,
        undefined,
        parentFragment
      )
    }
    const textNode = createTextNode(child)
    renderChildInIndexPosition(textNode, childIndex, parentElement, manager, parentFragment)
    setCreatedChild(manager, childIndex, createdTextChild(childIndex, textNode), parentFragment)
  }
}

function createdTextChild(index: string, element: Text): RvdCreatedNode {
  return { element, index, isText: true }
}
