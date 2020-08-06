import { isObservable } from 'rxjs'

import {
  RxSub,
  RvdComponentElement,
  RvdDOMElement,
  RvdFragmentElement,
  RvdFragmentNode,
  RvdObservableFragmentNode,
  RvdObservableNode,
  RvdObservableComponentNode,
  RvdFragmentNodeItem
} from '@@types'

import { syncObservable, createDomElement, isSvgElement, connectElementProps } from './utils'

import createComponent from './create-component'
import renderElementChildren from './children-renderer/renderer'
import { streamChildToParent, switchMapChild } from './children-renderer/helpers'

export function renderRvdComponent(
  rvdComponentElement: RvdComponentElement
): RvdObservableComponentNode {
  const componentChild = createComponent(rvdComponentElement)

  if (isObservable(componentChild)) {
    return switchMapChild()(componentChild)
  } else {
    return streamChildToParent(componentChild)
  }
}

export function renderRvdFragment(
  rvdFragmentElement: RvdFragmentElement
): RvdObservableFragmentNode {
  const fragmentNode = rvdFragmentElement.children.reduce<RvdFragmentNode>((node, child, index) => {
    let childNode$: RvdFragmentNodeItem

    if (isObservable(child)) {
      childNode$ = switchMapChild()(child)
    } else {
      childNode$ = streamChildToParent(child)
    }

    node[index] = childNode$

    return node
  }, {})
  return syncObservable(fragmentNode)
}

export function renderRvdElement(
  rvdElement: RvdDOMElement
): RvdObservableNode {
  const element = createDomElement(
    rvdElement.type,
    isSvgElement(rvdElement)
  )
  // TODO: Connect Element RvdProps Full Implementation
  const elementSubscription: RxSub = connectElementProps(rvdElement, element)


  if (rvdElement.children) {
    const childrenSubscription = renderElementChildren(rvdElement.children, element)
    elementSubscription.add(childrenSubscription)
  }

  return syncObservable({
    dom: element,
    elementSubscription
  })
}
