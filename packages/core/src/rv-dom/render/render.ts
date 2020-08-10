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
  RvdFragmentNodeItem, CreatedChildrenManager, RvdFragmentRenderer
} from '@@types'

import {
  syncObservable,
  createDomElement,
  isSvgElement,
  connectElementProps,
  isRvdElement
} from './utils'

import createComponent from './create-component'
import renderElementChildren from './children-renderer/renderer'
import { streamChildToParent, switchMapChild } from './children-renderer/helpers'
import { _FRAGMENT } from '@@shared'

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
  fragmentIndex: string,
  createdChildren: CreatedChildrenManager
): RvdFragmentRenderer  {
  return (rvdFragmentElement: RvdFragmentElement) => {

    if (!createdChildren.hasFragment(fragmentIndex)) {

    }
    const createdFragment = createdChildren.getFragment(fragmentIndex)

    const fragmentNode = rvdFragmentElement.children.reduce<RvdFragmentNode>(
      (node, child, index) => {
        let childNode$: RvdFragmentNodeItem
        const childIndex = `${fragmentIndex}.${index}` // 3.5

        if (isObservable(child)) {
          childNode$ = switchMapChild()(child)
        } else {
          if (isRvdElement(child) && child.key) { // adas
            const indexForKey = createdFragment.fragmentChildKeys[child.key] // 3.1
            if (indexForKey) {
              if (indexForKey === childIndex) { // false
                return node
              } else {
                // childIndex: 3.3
                // indexForKey: 3.5

              }
            } else {
              createdFragment.fragmentChildKeys[child.key] = childIndex // fuck: '3.2'
            }
          }


          childNode$ = streamChildToParent(child)
        }

        node[childIndex] = childNode$

        return node
      }, {})
    return syncObservable(fragmentNode)
  }

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
