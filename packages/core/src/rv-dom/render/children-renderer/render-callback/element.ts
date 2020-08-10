import {
  CreatedChildrenManager, CreatedFragmentChild,
  CreatedNodeChild,
  RenderCallback,
  RvdDOMElement,
  RvdNode,
  RxSub
} from '@@types'
import { renderRvdElement } from '../../render'
import {
  removeChildFromIndexPosition,
  renderChildInIndexPosition,
  replaceChildOnIndexPosition
} from '../dom-renderer'
import { renderTypeSwitch, unsubscribe } from '../../utils'
import { getSortedFragmentChildIndexes } from '../../utils/children-manager'

const replace = (
  elementNode: RvdNode,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub
) => (existingChild: CreatedNodeChild) => {
  const childElementSubscription = elementNode.elementSubscription
  if (childElementSubscription) {
    childrenSubscription.add(childElementSubscription)
  }

  replaceChildOnIndexPosition(
    newChild => {
      unsubscribe(existingChild)
      createdChildren.add(childIndex, {
        ...newChild,
        subscription: childElementSubscription
      })
    },
    elementNode.dom,
    childIndex,
    element,
    createdChildren
  )
}

const replaceFragment = (
  renderFn: () => void,
  elementNode: RvdNode,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager
) => (existingFragment: CreatedFragmentChild) => {
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
  renderFn()
}

const render = (
  elementNode: RvdNode,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub
) => () => {
  const childElementSubscription = elementNode.elementSubscription
  if (childElementSubscription) {
    childrenSubscription.add(childElementSubscription)
  }

  renderChildInIndexPosition(
    newChild => createdChildren.add(childIndex, {
      ...newChild,
      subscription: childElementSubscription
    }),
    elementNode.dom,
    childIndex,
    element,
    createdChildren
  )
}


export const elementRenderCallback: RenderCallback = (
  childIndex,
  element,
  createdChildren,
  childrenSubscription
) => (child: RvdDOMElement): void => {
  renderRvdElement(child).subscribe(elementNode => {
    const renderFn = render(elementNode, childIndex, element, createdChildren, childrenSubscription)
    renderTypeSwitch(
      replace(elementNode, childIndex, element, createdChildren, childrenSubscription),
      replaceFragment(
        renderFn,
        elementNode,
        childIndex,
        element,
        createdChildren
      ),
      renderFn
    )(childIndex, createdChildren)
  })
}

/**
 * One time render callback - if child isn't Observable, then it will not
 * change in runtime, function will be called just once and it's sure that
 * no other node was rendered on that position
 * @param childIndex
 * @param element
 * @param createdChildren
 * @param childrenSubscription
 */
export const staticElementRenderCallback: RenderCallback = (
  childIndex,
  element,
  createdChildren,
  childrenSubscription
) => (child: RvdDOMElement): void => {
  renderRvdElement(child).subscribe(elementNode => render(
    elementNode,
    childIndex,
    element,
    createdChildren,
    childrenSubscription
  )())
}
